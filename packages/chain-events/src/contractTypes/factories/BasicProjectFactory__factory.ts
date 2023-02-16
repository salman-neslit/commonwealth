/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import type {
  Signer,
  BigNumberish,
  Overrides} from "ethers";
import {
  Contract,
  ContractFactory
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";

import type { BasicProjectFactory } from "../BasicProjectFactory";

export class BasicProjectFactory__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    _owner: string,
    _acceptedTokens: string[],
    _protocolFee: BigNumberish,
    _feeTo: string,
    _projectImp: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<BasicProjectFactory> {
    return super.deploy(
      _owner,
      _acceptedTokens,
      _protocolFee,
      _feeTo,
      _projectImp,
      overrides || {}
    ) as Promise<BasicProjectFactory>;
  }
  getDeployTransaction(
    _owner: string,
    _acceptedTokens: string[],
    _protocolFee: BigNumberish,
    _feeTo: string,
    _projectImp: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _owner,
      _acceptedTokens,
      _protocolFee,
      _feeTo,
      _projectImp,
      overrides || {}
    );
  }
  attach(address: string): BasicProjectFactory {
    return super.attach(address) as BasicProjectFactory;
  }
  connect(signer: Signer): BasicProjectFactory__factory {
    return super.connect(signer) as BasicProjectFactory__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): BasicProjectFactory {
    return new Contract(address, _abi, signerOrProvider) as BasicProjectFactory;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        internalType: "address[]",
        name: "_acceptedTokens",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "_protocolFee",
        type: "uint256",
      },
      {
        internalType: "address payable",
        name: "_feeTo",
        type: "address",
      },
      {
        internalType: "address",
        name: "_projectImp",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "projectIndex",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newProject",
        type: "address",
      },
    ],
    name: "ProjectCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_tokens",
        type: "address[]",
      },
    ],
    name: "addAcceptedTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_name",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_ipfsHash",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_cwUrl",
        type: "bytes32",
      },
      {
        internalType: "address payable",
        name: "_beneficiary",
        type: "address",
      },
      {
        internalType: "address",
        name: "_acceptedToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_threshold",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_deadline",
        type: "uint256",
      },
    ],
    name: "createProject",
    outputs: [
      {
        internalType: "address",
        name: "newProject",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getProtocolData",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "protocolFee",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxFee",
            type: "uint256",
          },
          {
            internalType: "address payable",
            name: "feeTo",
            type: "address",
          },
        ],
        internalType: "struct DataTypes.ProtocolData",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isAcceptedToken",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "numProjects",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "projectImp",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    name: "projects",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "protocolData",
    outputs: [
      {
        internalType: "uint256",
        name: "protocolFee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxFee",
        type: "uint256",
      },
      {
        internalType: "address payable",
        name: "feeTo",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "_feeTo",
        type: "address",
      },
    ],
    name: "setFeeTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_projectImpl",
        type: "address",
      },
    ],
    name: "setProjectImpl",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_protocolFee",
        type: "uint256",
      },
    ],
    name: "setProtocolFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b50604051620012bf380380620012bf8339810160408190526200003491620003dc565b6001600160a01b038516620000905760405162461bcd60e51b815260206004820152601460248201527f504a4641433a20494e56414c49445f4f574e455200000000000000000000000060448201526064015b60405180910390fd5b600083118015620000a357506127108311155b620000e65760405162461bcd60e51b8152602060048201526012602482015271504a4641433a20494e56414c49445f46454560701b604482015260640162000087565b6001600160a01b0382166200013e5760405162461bcd60e51b815260206004820152601460248201527f504a4641433a20494e56414c49445f464545544f000000000000000000000000604482015260640162000087565b6001600160a01b038116620001965760405162461bcd60e51b815260206004820152601b60248201527f504a4641433a20494e56414c49445f50524f4a4543545f414444520000000000604482015260640162000087565b600380546001600160a01b038088166001600160a01b0319928316179092556004805484841690831617905560408051606081018252868152612710602082018190529386169101819052600086905560019290925560028054909116909117905562000203846200020e565b50505050506200054f565b8051806200025f5760405162461bcd60e51b815260206004820152601860248201527f504a4641433a204e4f5f41434345505445445f544f4b454e0000000000000000604482015260640162000087565b60005b81811015620003c55760006001600160a01b03168382815181106200029757634e487b7160e01b600052603260045260246000fd5b60200260200101516001600160a01b03161415620002f85760405162461bcd60e51b815260206004820152601d60248201527f504a4641433a20494e56414c49445f41434345505445445f544f4b454e000000604482015260640162000087565b600660008483815181106200031d57634e487b7160e01b600052603260045260246000fd5b6020908102919091018101516001600160a01b031682528101919091526040016000205460ff16620003b0576001600660008584815181106200037057634e487b7160e01b600052603260045260246000fd5b60200260200101516001600160a01b03166001600160a01b0316815260200190815260200160002060006101000a81548160ff0219169083151502179055505b80620003bc81620004f8565b91505062000262565b505050565b8051620003d78162000536565b919050565b600080600080600060a08688031215620003f4578081fd5b8551620004018162000536565b602087810151919650906001600160401b038082111562000420578384fd5b818901915089601f83011262000434578384fd5b81518181111562000449576200044962000520565b8060051b604051601f19603f8301168101818110858211171562000471576200047162000520565b604052828152858101935084860182860187018e101562000490578788fd5b8795505b83861015620004bd57620004a881620003ca565b85526001959095019493860193860162000494565b5080995050505050505060408601519250620004dc60608701620003ca565b9150620004ec60808701620003ca565b90509295509295909350565b60006000198214156200051957634e487b7160e01b81526011600452602481fd5b5060010190565b634e487b7160e01b600052604160045260246000fd5b6001600160a01b03811681146200054c57600080fd5b50565b610d60806200055f6000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c8063a6217d0a11610071578063a6217d0a1461019c578063ca854b38146101af578063d7691f8f146101c2578063d8869b4f14610201578063f46901ed14610214578063ffd10afe1461022757600080fd5b80632d94bffe146100b95780633b6e750f146100f15780635a067baa14610124578063787dce3d146101495780638cf088d41461015e5780638da5cb5b14610189575b600080fd5b6100c1610250565b604080518251815260208084015190820152918101516001600160a01b0316908201526060015b60405180910390f35b6101146100ff366004610ac4565b60066020526000908152604090205460ff1681565b60405190151581526020016100e8565b6007546101349063ffffffff1681565b60405163ffffffff90911681526020016100e8565b61015c610157366004610c35565b6102ab565b005b600454610171906001600160a01b031681565b6040516001600160a01b0390911681526020016100e8565b600354610171906001600160a01b031681565b61015c6101aa366004610ae7565b610341565b6101716101bd366004610bce565b610377565b6000546001546002546101dd9291906001600160a01b031683565b6040805193845260208401929092526001600160a01b0316908201526060016100e8565b61015c61020f366004610ac4565b610723565b61015c610222366004610ac4565b6107c5565b610171610235366004610c4d565b6005602052600090815260409020546001600160a01b031681565b61027d6040518060600160405280600081526020016000815260200160006001600160a01b031681525090565b5060408051606081018252600054815260015460208201526002546001600160a01b03169181019190915290565b6003546001600160a01b031633146102de5760405162461bcd60e51b81526004016102d590610c71565b60405180910390fd5b6000811180156102f057506001548111155b61033c5760405162461bcd60e51b815260206004820152601b60248201527f504a4641433a20494e56414c49445f50524f544f434f4c5f464545000000000060448201526064016102d5565b600055565b6003546001600160a01b0316331461036b5760405162461bcd60e51b81526004016102d590610c71565b6103748161085e565b50565b60006001600160a01b0385166103cf5760405162461bcd60e51b815260206004820152601a60248201527f504a4641433a20494e56414c49445f42454e454649434941525900000000000060448201526064016102d5565b8261041c5760405162461bcd60e51b815260206004820152601860248201527f504a4641433a20494e56414c49445f5448524553484f4c44000000000000000060448201526064016102d5565b6000821161046c5760405162461bcd60e51b815260206004820152601760248201527f504a4641433a20494e56414c49445f444541444c494e4500000000000000000060448201526064016102d5565b6001600160a01b03841660009081526006602052604090205460ff166104df5760405162461bcd60e51b815260206004820152602260248201527f504a4641433a204e4f545f50524f544f434f4c5f41434345505445445f544f4b60448201526122a760f11b60648201526084016102d5565b6040516bffffffffffffffffffffffff193360601b16602082015260348101839052605481018890526074810189905260009060940160408051601f198184030181529190528051602090910120600454909150610546906001600160a01b031682610a0e565b6040805160a08101909152600754919350600091819061056d9063ffffffff166001610ca6565b63ffffffff16815260208082018d905260408083018d905260608084018d905233608094850152600054600254835163075fe13560e01b815287516004820152948701516024860152928601516044850152908501516064840152928401516001600160a01b03908116608484015260a483018a905260c4830189905260e4830193909352821661010482015288821661012482015289821661014482015291925084169063075fe1359061016401602060405180830381600087803b15801561063657600080fd5b505af115801561064a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061066e9190610bae565b50600780546001919060009061068b90849063ffffffff16610ca6565b82546101009290920a63ffffffff81810219909316918316021790915560078054821660009081526005602090815260409182902080546001600160a01b0319166001600160a01b038a1690811790915592548251941684528301919091527f63c92f9505d420bff631cb9df33be952bdc11e2118da36a850b43e6bcc4ce4de92500160405180910390a15050979650505050505050565b6003546001600160a01b0316331461074d5760405162461bcd60e51b81526004016102d590610c71565b6001600160a01b0381166107a35760405162461bcd60e51b815260206004820152601b60248201527f504a4641433a20494e56414c49445f50524f4a4543545f494d504c000000000060448201526064016102d5565b600480546001600160a01b0319166001600160a01b0392909216919091179055565b6003546001600160a01b031633146107ef5760405162461bcd60e51b81526004016102d590610c71565b6001600160a01b03811661083c5760405162461bcd60e51b8152602060048201526014602482015273504a4641433a20494e56414c49445f464545544f60601b60448201526064016102d5565b600280546001600160a01b0319166001600160a01b0392909216919091179055565b8051806108ad5760405162461bcd60e51b815260206004820152601860248201527f504a4641433a204e4f5f41434345505445445f544f4b454e000000000000000060448201526064016102d5565b60005b81811015610a095760006001600160a01b03168382815181106108e357634e487b7160e01b600052603260045260246000fd5b60200260200101516001600160a01b031614156109425760405162461bcd60e51b815260206004820152601d60248201527f504a4641433a20494e56414c49445f41434345505445445f544f4b454e00000060448201526064016102d5565b6006600084838151811061096657634e487b7160e01b600052603260045260246000fd5b6020908102919091018101516001600160a01b031682528101919091526040016000205460ff166109f7576001600660008584815181106109b757634e487b7160e01b600052603260045260246000fd5b60200260200101516001600160a01b03166001600160a01b0316815260200190815260200160002060006101000a81548160ff0219169083151502179055505b80610a0181610cce565b9150506108b0565b505050565b6000604051733d602d80600a3d3981f3363d3d373d3d3d363d7360601b81528360601b60148201526e5af43d82803e903d91602b57fd5bf360881b6028820152826037826000f59150506001600160a01b038116610aae5760405162461bcd60e51b815260206004820152601760248201527f455243313136373a2063726561746532206661696c656400000000000000000060448201526064016102d5565b92915050565b8035610abf81610d15565b919050565b600060208284031215610ad5578081fd5b8135610ae081610d15565b9392505050565b60006020808385031215610af9578182fd5b823567ffffffffffffffff80821115610b10578384fd5b818501915085601f830112610b23578384fd5b813581811115610b3557610b35610cff565b8060051b604051601f19603f83011681018181108582111715610b5a57610b5a610cff565b604052828152858101935084860182860187018a1015610b78578788fd5b8795505b83861015610ba157610b8d81610ab4565b855260019590950194938601938601610b7c565b5098975050505050505050565b600060208284031215610bbf578081fd5b81518015158114610ae0578182fd5b600080600080600080600060e0888a031215610be8578283fd5b8735965060208801359550604088013594506060880135610c0881610d15565b93506080880135610c1881610d15565b9699959850939692959460a0840135945060c09093013592915050565b600060208284031215610c46578081fd5b5035919050565b600060208284031215610c5e578081fd5b813563ffffffff81168114610ae0578182fd5b6020808252818101527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604082015260600190565b600063ffffffff808316818516808303821115610cc557610cc5610ce9565b01949350505050565b6000600019821415610ce257610ce2610ce9565b5060010190565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160a01b038116811461037457600080fdfea26469706673582212206ab70d2e30012203f49bec27dbb2e397d1aa0d89d7213ee70afc222b9864722a64736f6c63430008040033";
