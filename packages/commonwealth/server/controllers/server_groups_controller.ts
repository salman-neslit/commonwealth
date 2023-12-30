import { TokenBalanceCache as TokenBalanceCacheV1 } from '../../token-balance-cache/src';
import { DB } from '../models';
import BanCache from '../util/banCheckCache';
import { TokenBalanceCache as TokenBalanceCacheV2 } from '../util/tokenBalanceCache/tokenBalanceCache';
import {
  CreateGroupOptions,
  CreateGroupResult,
  __createGroup,
} from './server_groups_methods/create_group';
import {
  DeleteGroupOptions,
  DeleteGroupResult,
  __deleteGroup,
} from './server_groups_methods/delete_group';
import {
  GetGroupsOptions,
  GetGroupsResult,
  __getGroups,
} from './server_groups_methods/get_groups';
import {
  RefreshCommunityMembershipsOptions,
  RefreshCommunityMembershipsResult,
  __refreshCommunityMemberships,
} from './server_groups_methods/refresh_community_memberships';
import {
  RefreshMembershipOptions,
  RefreshMembershipResult,
  __refreshMembership,
} from './server_groups_methods/refresh_membership';
import {
  UpdateGroupOptions,
  UpdateGroupResult,
  __updateGroup,
} from './server_groups_methods/update_group';

/**
 * Implements methods related to groups
 */
export class ServerGroupsController {
  constructor(
    public models: DB,
    public tokenBalanceCacheV1: TokenBalanceCacheV1,
    public tokenBalanceCacheV2: TokenBalanceCacheV2,
    public banCache: BanCache,
  ) {}

  async refreshMembership(
    options: RefreshMembershipOptions,
  ): Promise<RefreshMembershipResult> {
    return __refreshMembership.call(this, options);
  }

  async refreshCommunityMemberships(
    options: RefreshCommunityMembershipsOptions,
  ): Promise<RefreshCommunityMembershipsResult> {
    return __refreshCommunityMemberships.call(this, options);
  }

  async getGroups(options: GetGroupsOptions): Promise<GetGroupsResult> {
    return __getGroups.call(this, options);
  }

  async createGroup(options: CreateGroupOptions): Promise<CreateGroupResult> {
    return __createGroup.call(this, options);
  }

  async updateGroup(options: UpdateGroupOptions): Promise<UpdateGroupResult> {
    return __updateGroup.call(this, options);
  }

  async deleteGroup(options: DeleteGroupOptions): Promise<DeleteGroupResult> {
    return __deleteGroup.call(this, options);
  }
}
