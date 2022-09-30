/* @jsx m */

import m from 'mithril';
import $ from 'jquery';
import Web3 from 'web3';

import 'pages/abi_factory_form.scss';

import { Contract, NodeInfo } from 'models';
import app from 'state';
import { ChainBase, WalletId } from 'common-common/src/types';
import Ethereum from 'controllers/chain/ethereum/main';
import { Contract as Web3Contract } from 'web3-eth-contract';
import { AbiInput, AbiItem, AbiOutput, isAddress } from 'web3-utils';
import { BigNumber, ethers } from 'ethers';
import { notifyError, notifySuccess } from 'controllers/app/notifications';
import { IdRow, InputRow, SelectRow } from 'views/components/metadata_rows';

import { CWButton } from 'views/components/component_kit/cw_button';
import {
  CWValidationText,
  ValidationStatus,
} from 'views/components/component_kit/cw_validation_text';

import {
  initChainForm,
  defaultChainRows,
  ethChainRows,
} from 'views/pages/create_community/chain_input_rows';

import {
  ChainFormFields,
  ChainFormState,
  EthChainAttrs,
  EthFormFields,
} from 'views/pages/create_community/types';
import {
  parseAbiItemsFromABI,
  parseEventFromABI,
  parseFunctionFromABI,
} from 'helpers/abi_utils';
import { factoryNicknameToCreateFunctionName } from 'helpers/types';
import EthereumChain from 'controllers/chain/ethereum/chain';
import { PageNotFound } from '../404';
import { PageLoading } from '../loading';
import { CWText } from '../../components/component_kit/cw_text';
import { CWTextInput } from '../../components/component_kit/cw_text_input';

type EthDaoFormFields = {
  tokenName: string;
};

type CreateFactoryDaoForm = {
  functionNameToFunctionInputArgs: Map<string, Map<number, string>>;
  daoFactoryType: string;
};

type CreateFactoryEthDaoForm = ChainFormFields &
  EthFormFields &
  EthDaoFormFields &
  CreateFactoryDaoForm;

type CreateAbiFactoryState = ChainFormState & {
  functionNameToFunctionOutput: Map<string, any[]>;
  form: CreateFactoryEthDaoForm;
};

export class AbiFactoryForm implements m.ClassComponent<EthChainAttrs> {
  private state: CreateAbiFactoryState = {
    message: '',
    loaded: false,
    loading: false,
    saving: false,
    status: undefined,
    functionNameToFunctionOutput: new Map<string, any[]>(),
    form: {
      functionNameToFunctionInputArgs: new Map<string, Map<number, string>>(),
      daoFactoryType: 'partybidfactory',
      address: '',
      chainString: 'Ethereum Mainnet',
      ethChainId: 1,
      id: '',
      name: '',
      nodeUrl: '',
      symbol: '',
      tokenName: 'token',
      ...initChainForm(),
    },
  };

  oninit(vnode) {
    this.state.form.nodeUrl = vnode.attrs.ethChains[1].url;
  }

  view(vnode) {
    const Bytes32 = ethers.utils.formatBytes32String;

    const disableField = !this.state.loaded;

    const getCurrChain = async (
      contractAddress: string
    ): Promise<EthereumChain> => {
      try {
        const contract: Contract =
          app.contracts.store.getContractByAddress(contractAddress);
        let chainNodeId = 1;
        if (contract.chainNodeId) {
          chainNodeId = contract.chainNodeId;
        }
        const nodeObj = app.config.nodes.getNodesByChainId(chainNodeId);

        const ethChain = new EthereumChain(app);

        const ethApi = await ethChain.init(nodeObj);

        return ethChain;
      } catch (e) {
        console.error(e);
        console.log(`App Error: ${e.message}`);
      }
    };

    const getWeb3Contract = async (
      contractAddress: string
    ): Promise<Web3Contract> => {
      const contract: Contract =
        app.contracts.store.getContractByAddress(contractAddress);
      // Initialize Chain and Create contract instance
      const chain = await getCurrChain(contractAddress);
      const web3Contract: Web3Contract = new chain.api.eth.Contract(
        parseAbiItemsFromABI(contract.abi),
        contractAddress
      );
      return web3Contract;
    };

    const createDao = async (nickname: string, fn: AbiItem) => {
      // handle array and int types
      const processedArgs = fn.inputs.map((arg: AbiInput, index: number) => {
        const type = arg.type;
        if (type.substring(0, 4) === 'uint')
          return BigNumber.from(
            this.state.form.functionNameToFunctionInputArgs
              .get(fn.name)
              .get(index)
          );
        if (type.substring(0, 4) === 'byte')
          return Bytes32(
            this.state.form.functionNameToFunctionInputArgs
              .get(fn.name)
              .get(index)
          );
        if (type.slice(-2) === '[]')
          return JSON.parse(
            this.state.form.functionNameToFunctionInputArgs
              .get(fn.name)
              .get(index)
          );
        return this.state.form.functionNameToFunctionInputArgs
          .get(fn.name)
          .get(index);
      });

      const contract = app.contracts.getByNickname(nickname);
      const functionContract = await getWeb3Contract(contract.address);

      // 5. Build function tx
      // Assumption is using this methodology for calling functions
      // https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#id26

      const methodSignature = `${fn.name}(${fn.inputs
        .map((input) => input.type)
        .join(',')})`;

      const functionTx = functionContract.methods[methodSignature](
        ...processedArgs
      );

      //   // get querying wallet
      const availableWallets = app.wallets.availableWallets(ChainBase.Ethereum);
      if (availableWallets.length === 0) {
        throw new Error('No wallet available');
      }
      // For now, we will only enable metamaskWallet, but this can change. Per discussion with Dillon

      const metamaskWallet = availableWallets.find(
        (wallet) => wallet.name === WalletId.Metamask
      );
      if (!metamaskWallet.enabled) {
        await metamaskWallet.enable();
      }

      const chain = await getCurrChain(contract.address);
      if (fn.stateMutability !== 'view' && fn.constant !== true) {
        if (contract.nickname === 'curated-factory-goerli') {
          const eventAbiItem = parseEventFromABI(
            contract.abi,
            'ProjectCreated'
          );

          // Sign Tx with PK if not view function
          chain
            .makeContractTx(
              contract.address,
              functionTx.encodeABI(),
              metamaskWallet
            )
            .then((txReceipt) => {
              console.log('txReceipt', txReceipt);
              const decodedLog = chain.api.eth.abi.decodeLog(
                eventAbiItem.inputs,
                txReceipt.logs[0].data,
                txReceipt.logs[0].topics
              );
              console.log('decodedLog', decodedLog);
              this.state.form.address = decodedLog.projectAddress;
            });
        }
      }
    };

    const loadFactoryContractAbi = (nickname: string) => {
      const contract: Contract = app.contracts.getByNickname(nickname);
      const factoryFn = factoryNicknameToCreateFunctionName[nickname];
      if (!factoryFn) return null;
      const abiFunction = parseFunctionFromABI(contract.abi, factoryFn);
      return abiFunction;
    };

    const renderFactoryFunction = () => {
      const fn = loadFactoryContractAbi(this.state.form.daoFactoryType);
      return (
        <div class="function-row">
          <CWText>{fn.name}</CWText>
          <CWText>{fn.stateMutability}</CWText>
          <div class="functions-input-container">
            {fn.inputs.map((input: AbiInput, inputIdx: number) => {
              return (
                <div>
                  <div class="function-inputs">
                    <CWText>[{inputIdx}]</CWText>
                    <CWText>{input.type}</CWText>
                    <CWText>{input.name}</CWText>
                  </div>
                  <div>
                    <CWTextInput
                      name="Contract Input Field"
                      placeholder="Insert Input Here"
                      oninput={(e) => {
                        if (
                          !this.state.form.functionNameToFunctionInputArgs.has(
                            fn.name
                          )
                        ) {
                          this.state.form.functionNameToFunctionInputArgs.set(
                            fn.name,
                            new Map<number, string>()
                          );
                          const inputArgMap =
                            this.state.form.functionNameToFunctionInputArgs.get(
                              fn.name
                            );
                          inputArgMap.set(inputIdx, e.target.value);
                          this.state.form.functionNameToFunctionInputArgs.set(
                            fn.name,
                            inputArgMap
                          );
                        } else {
                          const inputArgMap =
                            this.state.form.functionNameToFunctionInputArgs.get(
                              fn.name
                            );
                          inputArgMap.set(inputIdx, e.target.value);
                          this.state.form.functionNameToFunctionInputArgs.set(
                            fn.name,
                            inputArgMap
                          );
                        }
                        this.state.loaded = true;
                      }}
                      inputValidationFn={(
                        val: string
                      ): [ValidationStatus, string] => {
                        // TODO Array Validation will be complex. Check what cases we want to cover here
                        if (input.type.slice(-2) === '[]') {
                          if (val[0] !== '[' || val[val.length - 1] !== ']') {
                            return ['failure', 'Input must be an array'];
                          } else {
                            return ['success', ''];
                          }
                        }
                        if (input.type === 'bool') {
                          if (val !== 'true' && val !== 'false') {
                            return ['failure', 'Input must be a boolean'];
                          }
                        }
                        if (input.type.substring(0, 4) === 'uint') {
                          if (!Number.isNaN(Number(val))) {
                            return ['success', ''];
                          } else {
                            return ['failure', 'Input must be a number'];
                          }
                        } else if (input.type === 'bool') {
                          if (val === 'true' || val === 'false') {
                            return ['success', ''];
                          } else {
                            return ['failure', 'Input must be a boolean'];
                          }
                        } else if (input.type === 'address') {
                          if (val.length === 42) {
                            return ['success', ''];
                          } else {
                            return ['failure', 'Input must be an address'];
                          }
                        } else {
                          return ['success', ''];
                        }
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div class="functions-output-container">
            {fn.outputs.map((output: AbiOutput, i) => {
              const fnOutputArray = this.state.functionNameToFunctionOutput.get(
                fn.name
              );
              return (
                <div>
                  <div class="function-outputs">
                    <CWText>[{i}]</CWText>
                    <CWText>{output.type}</CWText>
                    <CWText>{output.name}</CWText>
                  </div>
                  <div>
                    <CWText>
                      {fnOutputArray && fnOutputArray[i].toString()
                        ? fnOutputArray[i].toString()
                        : ''}
                    </CWText>
                  </div>
                </div>
              );
            })}
          </div>
          <div class="function-call">
            <CWButton
              label="Submit"
              disabled={this.state.saving || !this.state.loaded}
              onclick={() => {
                notifySuccess('Submit Call button clicked!');
                this.state.saving = true;
                try {
                  createDao(this.state.form.daoFactoryType, fn);
                } catch (err) {
                  notifyError(
                    err.responseJSON?.error || 'Submitting Function Call failed'
                  );
                } finally {
                  this.state.saving = false;
                }
              }}
            />
          </div>
        </div>
      );
    };

    return (
      <div class="CreateCommunityForm">
        {...ethChainRows(vnode.attrs, this.state.form)}
        <SelectRow
          title="DAO Type"
          options={app.contracts.store
            .getContractFactories()
            .map((contract) => contract.nickname)}
          value={this.state.form.daoFactoryType}
          onchange={(value) => {
            this.state.form.daoFactoryType = value;
            this.state.loaded = true;
            console.log('loaded');
            m.redraw();
          }}
        />
        <div class="GeneralContractPage">
          <CWText type="h4">General Contract</CWText>
          <CWText>
            Selected Dao Factory: {this.state.form.daoFactoryType}
          </CWText>
          <div class="functions-container">
            <div class="header-row">
              <CWText>Name</CWText>
              <CWText>State Mutability</CWText>
              <CWText>Inputs</CWText>
              <CWText>Outputs</CWText>
              <CWText>Call Function</CWText>
            </div>
            {this.state.form.daoFactoryType !== '' && renderFactoryFunction()}
          </div>
        </div>
        {...defaultChainRows(this.state.form, disableField)}
      </div>
    );
  }
}
