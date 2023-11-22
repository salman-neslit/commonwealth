import Bluebird from 'bluebird';
import moment from 'moment';
import { Op, Sequelize } from 'sequelize';
import { AddressAttributes } from '../../models/address';
import { CommunityInstance } from '../../models/community';
import { GroupAttributes } from '../../models/group';
import { MembershipAttributes } from '../../models/membership';
import {
  BalanceSourceType,
  ContractSource,
  CosmosSource,
  NativeSource,
} from '../../util/requirementsModule/requirementsTypes';
import validateGroupMembership from '../../util/requirementsModule/validateGroupMembership';
import {
  Balances,
  GetBalancesOptions,
  GetCosmosBalancesOptions,
  GetErcBalanceOptions,
  GetEthNativeBalanceOptions,
} from '../../util/tokenBalanceCache/types';
import { ServerGroupsController } from '../server_groups_controller';

const MEMBERSHIP_TTL_SECONDS = 60 * 2;

export type RefreshCommunityMembershipsOptions = {
  community: CommunityInstance;
  group?: GroupAttributes;
};

export type RefreshCommunityMembershipsResult = MembershipAttributes[];

export async function __refreshCommunityMemberships(
  this: ServerGroupsController,
  { community, group }: RefreshCommunityMembershipsOptions,
): Promise<void> {
  const startedAt = Date.now();

  let groupsToUpdate: GroupAttributes[];
  if (group) {
    groupsToUpdate = [group];
  } else {
    groupsToUpdate = await this.getGroups({ community });
  }

  const addresses = await this.models.Address.findAll({
    where: {
      community_id: community.id,
      verified: {
        [Op.ne]: null,
      },
    },
    attributes: ['id', 'address'],
    include: {
      model: this.models.Membership,
      as: 'Memberships',
      required: false,
    },
  });

  console.log(
    `Checking ${addresses.length} addresses in ${groupsToUpdate.length} groups in ${community.id}...`,
  );
  const getBalancesOptions = await makeGetBalancesOptions(
    groupsToUpdate,
    addresses,
  );
  const allBalances: Balances = await Bluebird.reduce(
    getBalancesOptions,
    async (acc, options) => {
      const balances = await this.tokenBalanceCache.getBalances(options);
      return {
        ...acc,
        ...balances,
      };
    },
    {},
  );

  const toCreate = [];
  const toUpdate = [];

  const processMembership = async (
    address: AddressAttributes,
    currentGroup: GroupAttributes,
  ) => {
    const existingMembership = address.Memberships.find(
      ({ group_id }) => group_id === currentGroup.id,
    );
    if (existingMembership) {
      // membership exists
      const expiresAt = moment(existingMembership.last_checked).add(
        MEMBERSHIP_TTL_SECONDS,
        'seconds',
      );
      if (moment().isBefore(expiresAt)) {
        // membership is fresh, do nothing
        return;
      }
      // membership stale, update
      const computedMembership = await computeMembership(address, currentGroup);
      toUpdate.push(computedMembership);
      return;
    }

    // membership does not exist, create
    const computedMembership = await computeMembership(address, currentGroup);
    toCreate.push(computedMembership);
  };

  const computeMembership = async (
    address: AddressAttributes,
    currentGroup: GroupAttributes,
  ) => {
    const { requirements } = currentGroup;
    const { isValid, messages } = await validateGroupMembership(
      address.address,
      requirements,
      allBalances,
    );
    const computedMembership = {
      group_id: currentGroup.id,
      address_id: address.id,
      reject_reason: isValid ? null : JSON.stringify(messages),
      last_checked: Sequelize.literal('CURRENT_TIMESTAMP') as any,
    };
    return computedMembership;
  };

  for (const currentGroup of groupsToUpdate) {
    for (const address of addresses) {
      // populate toCreate and toUpdate arrays
      processMembership(address, currentGroup);
    }
  }

  console.log(
    `Done checking. Starting ${toCreate.length} creates and ${toUpdate.length} updates...`,
  );

  // perform creates and updates
  await this.models.Membership.bulkCreate([...toCreate, ...toUpdate], {
    updateOnDuplicate: ['reject_reason', 'last_checked'],
  });

  console.log(
    `Created ${toCreate.length} and updated ${toUpdate.length} memberships in ${
      community.id
    } within ${(Date.now() - startedAt) / 1000}s`,
  );
}

async function makeGetBalancesOptions(
  groups: GroupAttributes[],
  addresses: AddressAttributes[],
): Promise<GetBalancesOptions[]> {
  const allOptions: GetBalancesOptions[] = [];

  for (const address of addresses) {
    for (const group of groups) {
      for (const requirement of group.requirements) {
        if (requirement.rule === 'threshold') {
          // for each requirement, upsert the appropriate option
          switch (requirement.data.source.source_type) {
            // ContractSource
            case BalanceSourceType.ERC20:
            case BalanceSourceType.ERC721: {
              const castedSource = requirement.data.source as ContractSource;
              const existingOptions = allOptions.find((opt) => {
                const castedOpt = opt as GetErcBalanceOptions;
                return (
                  castedOpt.balanceSourceType === castedSource.source_type &&
                  castedOpt.sourceOptions.evmChainId ===
                    castedSource.evm_chain_id &&
                  castedOpt.sourceOptions.contractAddress ===
                    castedSource.contract_address
                );
              });
              if (existingOptions) {
                existingOptions.addresses.push(address.address);
              } else {
                allOptions.push({
                  balanceSourceType: castedSource.source_type,
                  sourceOptions: {
                    contractAddress: castedSource.contract_address,
                    evmChainId: castedSource.evm_chain_id,
                  },
                  addresses: [address.address],
                });
              }
              break;
            }
            // NativeSource
            case BalanceSourceType.ETHNative: {
              const castedSource = requirement.data.source as NativeSource;
              const existingOptions = allOptions.find((opt) => {
                const castedOpt = opt as GetEthNativeBalanceOptions;
                return (
                  castedOpt.balanceSourceType === BalanceSourceType.ETHNative &&
                  castedOpt.sourceOptions.evmChainId ===
                    castedSource.evm_chain_id
                );
              });
              if (existingOptions) {
                existingOptions.addresses.push(address.address);
              } else {
                allOptions.push({
                  balanceSourceType: BalanceSourceType.ETHNative,
                  sourceOptions: {
                    evmChainId: castedSource.evm_chain_id,
                  },
                  addresses: [address.address],
                });
              }
              break;
            }
            // CosmosSource
            case BalanceSourceType.CosmosNative: {
              const castedSource = requirement.data.source as CosmosSource;
              const existingOptions = allOptions.find((opt) => {
                const castedOpt = opt as GetCosmosBalancesOptions;
                return (
                  castedOpt.balanceSourceType ===
                    BalanceSourceType.CosmosNative &&
                  castedOpt.sourceOptions.cosmosChainId ===
                    castedSource.cosmos_chain_id
                );
              });
              if (existingOptions) {
                existingOptions.addresses.push(address.address);
              } else {
                allOptions.push({
                  balanceSourceType: BalanceSourceType.CosmosNative,
                  sourceOptions: {
                    cosmosChainId: castedSource.cosmos_chain_id,
                  },
                  addresses: [address.address],
                });
              }
              break;
            }
          }
        }
      }
    }
  }

  return allOptions;
}
