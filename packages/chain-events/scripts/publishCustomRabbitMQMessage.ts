import {IEventData} from "../src/chains/aave/types";
import {CWEvent, SupportedNetwork} from "../src";
import {publishRmqMsg} from "common-common/src/rabbitmq/util";
import {RABBITMQ_API_URI} from "../services/config";
import {RascalExchanges, RascalRoutingKeys} from "common-common/src/rabbitmq";
import models from 'chain-events/services/database/database';

async function main() {
  // @ts-ignore
  const ceData: IEventData = {"id": 10, "kind": "proposal-created", "values": ["0"], "targets": ["0xE710CEd57456D3A16152c32835B5FB4E72D9eA5b"], "endBlock": 16203604, "executor": "0x64c7d40c07EFAbec2AafdC243bF59eaF2195c6dc", "ipfsHash": "0x3876d28a014bc20432dcc3549ba95710446b98431d84c7f84fde6abe1baf527f", "proposer": "0xb55a948763e0d386b6dEfcD8070a522216AE42b1", "strategy": "0x90Dfd35F4a0BB2d30CDf66508085e33C353475D9", "calldatas": ["0x00000000000000000000000092d6c1e31e14520e676a687f0a93788b716beff5000000000000000000000000a8541f948411b3f95d9e89e8d339a56a9ed3d00b000000000000000000000000000000000000000000002fa54641bae8aaa00000"], "signatures": ["transfer(address,address,uint256)"], "startBlock": 16177324}
  const chainEvent: CWEvent<IEventData> = {
    blockNumber: 16170754,
    data: ceData,
    network: SupportedNetwork.Aave,
    chain: 'dydx'
  }

  const publishJson = await publishRmqMsg(
    RABBITMQ_API_URI,
    RascalExchanges.ChainEvents,
    RascalRoutingKeys.ChainEvents,
    chainEvent
  );

  console.log(publishJson);
}

async function clear() {
  // await models.sequelize.query(`
  // DELETE FROM "ChainEvents"
  // WHERE chain='dydx' AND blocknumber = 16170754;
  // `, {});

  console.log(await models.ChainEvent.destroy({
    where: {chain: 'dydx', block_number: 16170754}
  }));

  console.log(await models.ChainEntity.destroy(
    {where: {chain: 'dydx', type_id: '10'}}
  ));

  process.exit(1)
}

if (process.argv[2] === 'clear') clear();
else main();

