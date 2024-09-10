import { dispose, type DeepPartial } from '@hicommonwealth/core';
import * as schemas from '@hicommonwealth/schemas';
import {
  BalanceType,
  ChainBase,
  ChainNetwork,
  ChainType,
} from '@hicommonwealth/shared';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Model, ValidationError, type ModelStatic } from 'sequelize';
import { afterAll, describe, test } from 'vitest';
import z from 'zod';
import { models } from '../../src/database';
import { SeedOptions, seed } from '../../src/tester';

chai.use(chaiAsPromised);

// testSeed creates an entity using the `seed` function
// then attempts to find the entity and validate it
async function testSeed<T extends schemas.Aggregates>(
  name: T,
  values?: DeepPartial<z.infer<(typeof schemas)[T]>>,
  options: SeedOptions = { mock: true },
): Promise<z.infer<(typeof schemas)[T]>> {
  const [record, records] = await seed(name, values, options);
  expect(records.length, 'failed to create entity').to.be.gt(0);

  // perform schema validation on created entity (throws)
  const schema = schemas[name];
  const model: ModelStatic<Model> = models[name];
  const data: ReturnType<typeof schema.parse> = schema.parse(record);

  // attempt to find entity that was created
  const existingEntity = await model.findOne({
    where: {
      [model.primaryKeyAttribute]:
        data[model.primaryKeyAttribute as keyof typeof data],
    },
  });
  expect(existingEntity, 'failed to find created entity after creation').not.to
    .be.null;

  // perform schema validation on found entity (throws)
  return data;
}

describe('Seed functions', () => {
  let shouldExit = true;
  afterAll(async () => {
    await dispose()();
  });

  describe('User', () => {
    test('Should seed with defaults', async () => {
      await testSeed('User', { selected_community_id: null });
      await testSeed('User', { selected_community_id: null });
      shouldExit = false;
    });

    test('Should seed with overrides', async () => {
      expect(shouldExit).to.be.false;
      shouldExit = true;
      const values = {
        email: 'temp@gmail.com',
        emailVerified: true,
        isAdmin: true,
      };
      // NOTE: some props like emailVerified and isAdmin
      // are explicitly excluded via sequelize model config
      const result = await testSeed('User', values);
      expect(result).contains(values);
      shouldExit = false;
    });
  });

  describe('ChainNode', () => {
    test('Should seed with defaults', async () => {
      expect(shouldExit).to.be.false;
      shouldExit = true;
      await testSeed('ChainNode', { contracts: undefined });
      await testSeed('ChainNode', { contracts: undefined });
      shouldExit = false;
    });

    test('Should seed with overrides', async () => {
      expect(shouldExit).to.be.false;
      shouldExit = true;
      await testSeed('ChainNode', {
        url: 'mainnet1.edgewa.re',
        name: 'Edgeware Mainnet',
        balance_type: BalanceType.Substrate,
        contracts: [
          {
            address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
            token_name: 'sushi',
            symbol: 'SUSHI',
            type: ChainNetwork.ERC20,
            chain_node_id: 1,
            abi_id: undefined,
          },
        ],
      });
      shouldExit = false;
    });
  });

  describe('Community', () => {
    test('Should seed with overrides', async () => {
      expect(shouldExit).to.be.false;
      shouldExit = true;
      const node = await testSeed('ChainNode', { contracts: undefined });
      const user = await testSeed('User', { selected_community_id: null });
      await testSeed('Community', {
        id: 'ethereum',
        network: ChainNetwork.Ethereum,
        default_symbol: 'ETH',
        name: 'Ethereum',
        icon_url: 'assets/img/protocols/eth.png',
        active: true,
        type: ChainType.Chain,
        base: ChainBase.Ethereum,
        chain_node_id: node!.id,
        lifetime_thread_count: 1,
        profile_count: 1,
        Addresses: [
          {
            user_id: user.id,
            address: '0x34C3A5ea06a3A67229fb21a7043243B0eB3e853f',
            community_id: 'ethereum',
            verification_token: 'PLACEHOLDER',
            verification_token_expires: undefined,
            verified: new Date(),
            role: 'admin',
            is_user_default: false,
          },
        ],
      });

      await testSeed('Community', {
        id: 'superEth',
        network: ChainNetwork.Ethereum,
        default_symbol: 'SETH',
        name: 'Super Eth',
        icon_url: 'assets/img/protocols/eth.png',
        active: true,
        type: ChainType.Chain,
        base: ChainBase.Ethereum,
        chain_node_id: node!.id,
        lifetime_thread_count: 1,
        profile_count: 1,
        Addresses: [
          {
            user_id: user.id,
            address: '0x34C3A5ea06a3A67229fb21a7043243B0eB3e853f',
            community_id: 'ethereum',
            verification_token: 'PLACEHOLDER',
            verification_token_expires: undefined,
            verified: new Date(),
            role: 'admin',
            is_user_default: false,
          },
        ],
        groups: [
          {
            metadata: {
              name: 'hello',
              description: 'blah',
            },
          },
        ],
        topics: [{}, {}],
      });
      shouldExit = false;
    });

    test('Should not mock data', async () => {
      expect(shouldExit).to.be.false;
      shouldExit = true;
      expect(
        seed(
          'Community',
          {
            lifetime_thread_count: 0,
            profile_count: 1,
          },
          { mock: false },
        ),
      ).to.eventually.be.rejectedWith(ValidationError);
      shouldExit = false;
    });
  });
});
