/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as core from '../../../../core';
import { UpdateCommunityResponseChainNodeBalanceType } from './UpdateCommunityResponseChainNodeBalanceType';
import { UpdateCommunityResponseChainNodeContractsItem } from './UpdateCommunityResponseChainNodeContractsItem';
import { UpdateCommunityResponseChainNodeCosmosGovVersion } from './UpdateCommunityResponseChainNodeCosmosGovVersion';
import { UpdateCommunityResponseChainNodeHealth } from './UpdateCommunityResponseChainNodeHealth';
export const UpdateCommunityResponseChainNode = core.serialization.object({
  id: core.serialization.number().optional(),
  url: core.serialization.string().optional(),
  ethChainId: core.serialization.property(
    'eth_chain_id',
    core.serialization.number().optional(),
  ),
  altWalletUrl: core.serialization.property(
    'alt_wallet_url',
    core.serialization.string().optional(),
  ),
  privateUrl: core.serialization.property(
    'private_url',
    core.serialization.string().optional(),
  ),
  balanceType: core.serialization.property(
    'balance_type',
    UpdateCommunityResponseChainNodeBalanceType.optional(),
  ),
  name: core.serialization.string().optional(),
  description: core.serialization.string().optional(),
  ss58: core.serialization.number().optional(),
  bech32: core.serialization.string().optional(),
  slip44: core.serialization.number().optional(),
  cosmosChainId: core.serialization.property(
    'cosmos_chain_id',
    core.serialization.string().optional(),
  ),
  cosmosGovVersion: core.serialization.property(
    'cosmos_gov_version',
    UpdateCommunityResponseChainNodeCosmosGovVersion.optional(),
  ),
  health: UpdateCommunityResponseChainNodeHealth.optional(),
  contracts: core.serialization
    .list(UpdateCommunityResponseChainNodeContractsItem)
    .optional(),
  blockExplorer: core.serialization.property(
    'block_explorer',
    core.serialization.string().optional(),
  ),
  maxCeBlockRange: core.serialization.property(
    'max_ce_block_range',
    core.serialization.number().optional(),
  ),
  createdAt: core.serialization.property(
    'created_at',
    core.serialization.date().optional(),
  ),
  updatedAt: core.serialization.property(
    'updated_at',
    core.serialization.date().optional(),
  ),
});