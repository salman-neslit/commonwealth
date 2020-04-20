import chai from 'chai';
import { Hash, EventRecord, Header } from '@polkadot/types/interfaces';

import { constructFakeApi } from './testUtil';
import Poller from '../../../../shared/events/edgeware/poller';

const { assert } = chai;

// we need a number that implements "isEmpty" when 0, to align with
// the Substrate Hash's interface
class IMockHash extends Number {
  get isEmpty(): boolean {
    return this.valueOf() === 0;
  }
}

const hashNums: number[] = [...Array(10).keys()].map((i) => i < 5 ? 0 : i);
const hashes = hashNums.map((n) => new IMockHash(n)) as unknown as Hash[];
const headers: Header[] = hashNums.map((hash) => {
  if (hash === 0) {
    return undefined;
  } else {
    return {
      parentHash: (hash - 1),
      number: 100 + hash,
      hash,
    } as unknown as Header;
  }
});

const events = {
  6: [{ event: { data: [1] } }] as unknown as EventRecord[],
  8: [{ event: { data: [2] } }, { event: { data: [3, 4] } }] as unknown as EventRecord[],
};

const getMockApi = () => {
  return constructFakeApi({
    getHeader: (hash?: Hash) => {
      if (hash === undefined) {
        hash = hashes[hashes.length - 1];
      }
      return headers[hash as unknown as number];
    },
    'events.at': (hash: Hash) => {
      return events[hash as unknown as number] || [];
    },
    'blockHash.multi': (blockNumbers: number[]) => {
      return blockNumbers.map((n) => hashes[n - 100]);
    },
  });
};

/* eslint-disable: dot-notation */
describe('Edgeware Event Poller Tests', () => {
  it('should return block data', async () => {
    // setup mock data
    const api = getMockApi();

    // setup test class
    const poller = new Poller(api);

    // run test
    const blocks = await poller.poll({ startBlock: 105, endBlock: 108 });
    assert.lengthOf(blocks, 3);
    assert.equal(+blocks[0].header.number, 105);
    assert.deepEqual(blocks[0].events, []);
    assert.equal(+blocks[1].header.number, 106);
    assert.deepEqual(blocks[1].events, events[6]);
    assert.equal(+blocks[2].header.number, 107);
    assert.deepEqual(blocks[2].events, []);
  });

  it('should skip zeroed hashes', async () => {
    // setup mock data
    const api = getMockApi();

    // setup test class
    const poller = new Poller(api);

    // run test
    const blocks = await poller.poll({ startBlock: 101, endBlock: 106 });
    assert.lengthOf(blocks, 1);
    assert.equal(+blocks[0].header.number, 105);
    assert.deepEqual(blocks[0].events, []);
  });


  it('should derive endblock from header', async () => {
    // setup mock data
    const api = getMockApi();

    // setup test class
    const poller = new Poller(api);

    // run test
    const blocks = await poller.poll({ startBlock: 107 });
    assert.lengthOf(blocks, 2);
    assert.equal(+blocks[0].header.number, 107);
    assert.deepEqual(blocks[0].events, []);
    assert.equal(+blocks[1].header.number, 108);
    assert.deepEqual(blocks[1].events, events[8]);
  });

  // TODO: fail tests
});
