import type { Cluster } from '@solana/web3.js';
import BN from 'bn.js';
import { AppError } from 'common-common/src/errors';
import {
  BalanceType,
  ChainBase,
  ChainType,
  DefaultPage,
  NotificationCategories,
} from 'common-common/src/types';
import { Op } from 'sequelize';
import { urlHasValidHTTPPrefix } from '../../../shared/utils';

import type { AddressInstance } from '../../models/address';
import type { ChainAttributes } from '../../models/chain';
import type { ChainNodeAttributes } from '../../models/chain_node';
import type { RoleAttributes } from '../../models/role';

import { RoleInstanceWithPermission } from '../../util/roles';
import testSubstrateSpec from '../../util/testSubstrateSpec';
import { ALL_CHAINS } from '../../middleware/databaseValidationService';
import axios from 'axios';
import { UserInstance } from '../../models/user';
import { getFileSizeBytes } from '../../util/getFilesSizeBytes';
import { ServerCommunitiesController } from '../server_communities_controller';

const MAX_IMAGE_SIZE_KB = 500;

export const Errors = {
  NoId: 'Must provide id',
  ReservedId: 'The id is reserved and cannot be used',
  NoName: 'Must provide name',
  InvalidNameLength: 'Name should not exceed 255',
  NoSymbol: 'Must provide symbol',
  InvalidSymbolLength: 'Symbol should not exceed 9',
  NoType: 'Must provide chain type',
  NoBase: 'Must provide chain base',
  NoNodeUrl: 'Must provide node url',
  InvalidNodeUrl: 'Node url must begin with http://, https://, ws://, wss://',
  InvalidNode: 'RPC url returned invalid response. Check your node url',
  MustBeWs: 'Node must support websockets on ethereum',
  InvalidBase: 'Must provide valid chain base',
  InvalidChainId: 'Ethereum chain ID not provided or unsupported',
  InvalidChainIdOrUrl:
    'Could not determine a valid endpoint for provided chain',
  ChainAddressExists: 'The address already exists',
  ChainIDExists:
    'The id for this chain already exists, please choose another id',
  ChainNameExists:
    'The name for this chain already exists, please choose another name',
  ChainNodeIdExists: 'The chain node with this id already exists',
  CosmosChainNameRequired:
    'cosmos_chain_id is a required field. It should be the chain name as registered in the Cosmos Chain Registry.',
  InvalidIconUrl: 'Icon url must begin with https://',
  InvalidWebsite: 'Website must begin with https://',
  InvalidDiscord: 'Discord must begin with https://',
  InvalidElement: 'Element must begin with https://',
  InvalidTelegram: 'Telegram must begin with https://t.me/',
  InvalidGithub: 'Github must begin with https://github.com/',
  InvalidAddress: 'Address is invalid',
  NotAdmin: 'Must be admin',
  ImageDoesntExist: `Image url provided doesn't exist`,
  ImageTooLarge: `Image must be smaller than ${MAX_IMAGE_SIZE_KB}kb`,
  UnegisteredCosmosChain: `Check https://cosmos.directory. Provided chain_name is not registered in the Cosmos Chain Registry`,
};

export type CreateCommunityOptions = {
  user: UserInstance;
  community: Omit<ChainAttributes, 'substrate_spec'> &
    Omit<ChainNodeAttributes, 'id'> & {
      id: string;
      node_url: string;
      substrate_spec: string;
      address?: string;
      decimals: number;
    };
};

export type CreateCommunityResult = {
  chain: ChainAttributes;
  node: ChainNodeAttributes;
  role: RoleAttributes;
  admin_address: string;
};

export async function __createCommunity(
  this: ServerCommunitiesController,
  { user, community }: CreateCommunityOptions
): Promise<CreateCommunityResult> {
  if (!user) {
    throw new AppError('Not signed in');
  }
  // require Admin privilege for creating Chain/DAO
  if (
    community.type !== ChainType.Token &&
    community.type !== ChainType.Offchain
  ) {
    if (!user.isAdmin) {
      throw new AppError(Errors.NotAdmin);
    }
  }
  if (!community.id || !community.id.trim()) {
    throw new AppError(Errors.NoId);
  }
  if (community.id === ALL_CHAINS) {
    throw new AppError(Errors.ReservedId);
  }
  if (!community.name || !community.name.trim()) {
    throw new AppError(Errors.NoName);
  }
  if (community.name.length > 255) {
    throw new AppError(Errors.InvalidNameLength);
  }
  if (!community.default_symbol || !community.default_symbol.trim()) {
    throw new AppError(Errors.NoSymbol);
  }
  if (community.default_symbol.length > 9) {
    throw new AppError(Errors.InvalidSymbolLength);
  }
  if (!community.type || !community.type.trim()) {
    throw new AppError(Errors.NoType);
  }
  if (!community.base || !community.base.trim()) {
    throw new AppError(Errors.NoBase);
  }

  if (
    community.icon_url &&
    (await getFileSizeBytes(community.icon_url)) / 1024 > MAX_IMAGE_SIZE_KB
  ) {
    throw new AppError(Errors.ImageTooLarge);
  }

  const existingBaseChain = await this.models.Chain.findOne({
    where: { base: community.base },
  });
  if (!existingBaseChain) {
    throw new AppError(Errors.InvalidBase);
  }

  // TODO: refactor this to use existing nodes rather than always creating one

  let eth_chain_id: number = null;
  let cosmos_chain_id: string | null = null;
  let url = community.node_url;
  let altWalletUrl = community.alt_wallet_url;
  let privateUrl: string | undefined;
  let sanitizedSpec;

  // always generate a chain id
  if (community.base === ChainBase.Ethereum) {
    if (!community.eth_chain_id || !+community.eth_chain_id) {
      throw new AppError(Errors.InvalidChainId);
    }
    eth_chain_id = +community.eth_chain_id;
  }

  // cosmos_chain_id is the canonical identifier for a cosmos chain.
  if (community.base === ChainBase.CosmosSDK) {
    // Our convention is to follow the "chain_name" standard established by the
    // Cosmos Chain Registry:
    // https://github.com/cosmos/chain-registry/blob/dbec1643b587469383635fd345634fb19075b53a/chain.schema.json#L1-L20
    // This community-led registry seeks to track chain info for all Cosmos chains.
    // The primary key for a chain there is "chain_name." This is our cosmos_chain_id.
    // It is a lowercase alphanumeric name, like 'osmosis'.
    // See: https://github.com/hicommonwealth/commonwealth/issues/4951
    cosmos_chain_id = community.cosmos_chain_id;

    if (!cosmos_chain_id) {
      throw new AppError(Errors.CosmosChainNameRequired);
    } else {
      const oldChainNode = await this.models.ChainNode.findOne({
        where: { cosmos_chain_id },
      });
      if (oldChainNode && oldChainNode.cosmos_chain_id === cosmos_chain_id) {
        throw new AppError(`${Errors.ChainNodeIdExists}: ${cosmos_chain_id}`);
      }
    }

    const REGISTRY_API_URL = 'https://cosmoschains.thesilverfox.pro';
    const { data: chains } = await axios.get(
      `${REGISTRY_API_URL}/api/v1/mainnet`
    );
    const foundRegisteredChain = chains?.find(
      (chain) => chain === cosmos_chain_id
    );
    if (!foundRegisteredChain) {
      throw new AppError(
        `${Errors.UnegisteredCosmosChain}: ${cosmos_chain_id}`
      );
    }
  }

  // if not offchain, also validate the address
  if (
    community.base === ChainBase.Ethereum &&
    community.type !== ChainType.Offchain
  ) {
    const Web3 = (await import('web3')).default;
    if (!Web3.utils.isAddress(community.address)) {
      throw new AppError(Errors.InvalidAddress);
    }

    // override provided URL for eth chains (typically ERC20) with stored, unless none found
    const node = await this.models.ChainNode.scope('withPrivateData').findOne({
      where: {
        eth_chain_id,
      },
    });
    if (!node && !user.isAdmin) {
      // if creating a new ETH node, must be admin -- users cannot submit custom URLs
      throw new AppError(Errors.NotAdmin);
    }
    if (!node && !url) {
      // must provide at least url to create a new node
      throw new AppError(Errors.InvalidChainIdOrUrl);
    }
    if (node) {
      url = node.url;
      altWalletUrl = node.alt_wallet_url;
      privateUrl = node.private_url;
    }

    const node_url = privateUrl || url;
    const provider =
      node_url.slice(0, 4) == 'http'
        ? new Web3.providers.HttpProvider(node_url)
        : new Web3.providers.WebsocketProvider(node_url);

    const web3 = new Web3(provider);
    const code = await web3.eth.getCode(community.address);
    if (provider instanceof Web3.providers.WebsocketProvider)
      provider.disconnect(1000, 'finished');
    if (code === '0x') {
      throw new AppError(Errors.InvalidAddress);
    }

    // TODO: test altWalletUrl if available
  } else if (
    community.base === ChainBase.Solana &&
    community.type !== ChainType.Offchain
  ) {
    const solw3 = await import('@solana/web3.js');
    let pubKey;
    try {
      pubKey = new solw3.PublicKey(community.address);
    } catch (e) {
      throw new AppError(Errors.InvalidAddress);
    }
    try {
      const clusterUrl = solw3.clusterApiUrl(url as Cluster);
      const connection = new solw3.Connection(clusterUrl);
      const supply = await connection.getTokenSupply(pubKey);
      const { amount } = supply.value;
      if (new BN(amount, 10).isZero()) {
        throw new AppError('Invalid supply amount');
      }
    } catch (e) {
      throw new AppError(Errors.InvalidNodeUrl);
    }
  } else if (
    community.base === ChainBase.CosmosSDK &&
    community.type !== ChainType.Offchain
  ) {
    // test cosmos endpoint validity -- must be http(s)
    if (!urlHasValidHTTPPrefix(url)) {
      throw new AppError(Errors.InvalidNodeUrl);
    }
    try {
      const cosm = await import('@cosmjs/tendermint-rpc');
      const tmClient = await cosm.Tendermint34Client.connect(url);
      await tmClient.block();
    } catch (err) {
      throw new AppError(Errors.InvalidNode);
    }

    // TODO: test altWalletUrl if available
  } else if (
    community.base === ChainBase.Substrate &&
    community.type !== ChainType.Offchain
  ) {
    const spec = community.substrate_spec || '{}';
    if (community.substrate_spec) {
      try {
        sanitizedSpec = await testSubstrateSpec(spec, community.node_url);
      } catch (e) {
        throw new AppError(Errors.InvalidNode);
      }
    }
  } else {
    if (!url || !url.trim()) {
      throw new AppError(Errors.InvalidNodeUrl);
    }
    if (!urlHasValidHTTPPrefix(url) && !url.match(/wss?:\/\//)) {
      throw new AppError(Errors.InvalidNodeUrl);
    }
  }

  const {
    id,
    name,
    default_symbol,
    icon_url,
    description,
    network,
    type,
    website,
    discord,
    telegram,
    github,
    element,
    base,
    bech32_prefix,
    token_name,
  } = community;
  if (website && !urlHasValidHTTPPrefix(website)) {
    throw new AppError(Errors.InvalidWebsite);
  } else if (discord && !urlHasValidHTTPPrefix(discord)) {
    throw new AppError(Errors.InvalidDiscord);
  } else if (element && !urlHasValidHTTPPrefix(element)) {
    throw new AppError(Errors.InvalidElement);
  } else if (telegram && !telegram.startsWith('https://t.me/')) {
    throw new AppError(Errors.InvalidTelegram);
  } else if (github && !github.startsWith('https://github.com/')) {
    throw new AppError(Errors.InvalidGithub);
  } else if (icon_url && !urlHasValidHTTPPrefix(icon_url)) {
    throw new AppError(Errors.InvalidIconUrl);
  }

  const oldChain = await this.models.Chain.findOne({
    where: { [Op.or]: [{ name: community.name }, { id: community.id }] },
  });
  if (oldChain && oldChain.id === community.id) {
    throw new AppError(Errors.ChainIDExists);
  }
  if (oldChain && oldChain.name === community.name) {
    throw new AppError(Errors.ChainNameExists);
  }

  const [node] = await this.models.ChainNode.scope(
    'withPrivateData'
  ).findOrCreate({
    where: { [Op.or]: [{ url }, { eth_chain_id }] },
    defaults: {
      url,
      eth_chain_id,
      cosmos_chain_id,
      alt_wallet_url: altWalletUrl,
      private_url: privateUrl,
      balance_type:
        base === ChainBase.CosmosSDK
          ? BalanceType.Cosmos
          : base === ChainBase.Substrate
          ? BalanceType.Substrate
          : base === ChainBase.Ethereum
          ? BalanceType.Ethereum
          : // beyond here should never really happen, but just to make sure...
          base === ChainBase.NEAR
          ? BalanceType.NEAR
          : base === ChainBase.Solana
          ? BalanceType.Solana
          : undefined,
      // use first chain name as node name
      name: community.name,
    },
  });

  const chain = await this.models.Chain.create({
    id,
    name,
    default_symbol,
    icon_url,
    description,
    network,
    type,
    website,
    discord,
    telegram,
    github,
    element,
    base,
    bech32_prefix,
    active: true,
    substrate_spec: sanitizedSpec || '',
    chain_node_id: node.id,
    token_name,
    has_chain_events_listener: network === 'aave' || network === 'compound',
    default_page: DefaultPage.Homepage,
    has_homepage: true,
  });

  if (community.address) {
    const erc20Abi = await this.models.ContractAbi.findOne({
      where: {
        nickname: 'erc20',
      },
    });

    const [contract] = await this.models.Contract.findOrCreate({
      where: {
        address: community.address,
        chain_node_id: node.id,
      },
      defaults: {
        address: community.address,
        chain_node_id: node.id,
        decimals: community.decimals,
        token_name: chain.token_name,
        symbol: chain.default_symbol,
        type: chain.network,
        abi_id: chain.network === 'erc20' ? erc20Abi?.id : null,
      },
    });

    await this.models.CommunityContract.create({
      chain_id: chain.id,
      contract_id: contract.id,
    });

    chain.Contract = contract;
  }

  const nodeJSON = node.toJSON();
  delete nodeJSON.private_url;

  await this.models.Topic.create({
    chain_id: chain.id,
    name: 'General',
    featured_in_sidebar: true,
  });

  // try to make admin one of the user's addresses
  // TODO: @Zak extend functionality here when we have Bases + Wallets refactored
  let role: RoleInstanceWithPermission | undefined;
  let addressToBeAdmin: AddressInstance | undefined;

  if (chain.base === ChainBase.Ethereum) {
    addressToBeAdmin = await this.models.Address.scope(
      'withPrivateData'
    ).findOne({
      where: {
        user_id: user.id,
        address: {
          [Op.startsWith]: '0x',
        },
      },
      include: [
        {
          model: this.models.Chain,
          where: { base: chain.base },
          required: true,
        },
      ],
    });
  } else if (chain.base === ChainBase.NEAR) {
    addressToBeAdmin = await this.models.Address.scope(
      'withPrivateData'
    ).findOne({
      where: {
        user_id: user.id,
        address: {
          [Op.endsWith]: '.near',
        },
      },
      include: [
        {
          model: this.models.Chain,
          where: { base: chain.base },
          required: true,
        },
      ],
    });
  } else if (chain.base === ChainBase.Solana) {
    addressToBeAdmin = await this.models.Address.scope(
      'withPrivateData'
    ).findOne({
      where: {
        user_id: user.id,
        address: {
          // This is the regex formatting for solana addresses per their website
          [Op.regexp]: '[1-9A-HJ-NP-Za-km-z]{32,44}',
        },
      },
      include: [
        {
          model: this.models.Chain,
          where: { base: chain.base },
          required: true,
        },
      ],
    });
  }

  if (addressToBeAdmin) {
    const newAddress = await this.models.Address.create({
      user_id: user.id,
      profile_id: addressToBeAdmin.profile_id,
      address: addressToBeAdmin.address,
      chain: chain.id,
      verification_token: addressToBeAdmin.verification_token,
      verification_token_expires: addressToBeAdmin.verification_token_expires,
      verified: addressToBeAdmin.verified,
      keytype: addressToBeAdmin.keytype,
      wallet_id: addressToBeAdmin.wallet_id,
      is_user_default: true,
      role: 'admin',
      last_active: new Date(),
    });

    role = new RoleInstanceWithPermission(
      { community_role_id: 0, address_id: newAddress.id },
      chain.id,
      'admin',
      0,
      0
    );

    await this.models.Subscription.findOrCreate({
      where: {
        subscriber_id: user.id,
        category_id: NotificationCategories.NewThread,
        chain_id: chain.id,
        is_active: true,
      },
    });
  }

  return {
    chain: chain.toJSON(),
    node: nodeJSON,
    role: role?.toJSON(),
    admin_address: addressToBeAdmin?.address,
  };
}