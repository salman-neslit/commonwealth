/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from "../../../index";
export interface CreateCommunityResponseCommunityChainNode {
    id?: number;
    url?: string;
    ethChainId?: number;
    altWalletUrl?: string;
    privateUrl?: string;
    balanceType?: CommonApi.CreateCommunityResponseCommunityChainNodeBalanceType;
    name?: string;
    description?: string;
    ss58?: number;
    bech32?: string;
    slip44?: number;
    cosmosChainId?: string;
    cosmosGovVersion?: CommonApi.CreateCommunityResponseCommunityChainNodeCosmosGovVersion;
    health?: CommonApi.CreateCommunityResponseCommunityChainNodeHealth;
    contracts?: CommonApi.CreateCommunityResponseCommunityChainNodeContractsItem[];
    blockExplorer?: string;
    maxCeBlockRange?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
