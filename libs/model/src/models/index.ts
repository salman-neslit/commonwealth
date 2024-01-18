import type { Sequelize } from 'sequelize';

import type { AddressModelStatic } from './address';
import type { BanModelStatic } from './ban';
import type { ChainNodeModelStatic } from './chain_node';
import type { CollaborationModelStatic } from './collaboration';
import type { CommentModelStatic } from './comment';
import type { CommunityModelStatic } from './community';
import type { CommunityBannerModelStatic } from './community_banner';
import type { CommunityContractModelStatic } from './community_contract';
import type { CommunityContractTemplateMetadataStatic } from './community_contract_metadata';
import type { CommunityContractTemplateStatic } from './community_contract_template';
import type { CommunitySnapshotSpaceModelStatic } from './community_snapshot_spaces';
import type { ContractModelStatic } from './contract';
import type { ContractAbiModelStatic } from './contract_abi';
import type { DiscordBotConfigModelStatic } from './discord_bot_config';
import type { EvmEventSourceModelStatic } from './evmEventSource';
import type { GroupModelStatic } from './group';
import type { LastProcessedEvmBlockModelStatic } from './lastProcessedEvmBlock';
import type { LoginTokenModelStatic } from './login_token';
import type { MembershipModelStatic } from './membership';
import type { NotificationModelStatic } from './notification';
import type { NotificationCategoryModelStatic } from './notification_category';
import type { NotificationsReadModelStatic } from './notifications_read';
import type { PollModelStatic } from './poll';
import type { ProfileModelStatic } from './profile';
import type { ReactionModelStatic } from './reaction';
import type { SnapshotProposalModelStatic } from './snapshot_proposal';
import type { SnapshotSpaceModelStatic } from './snapshot_spaces';
import type { SsoTokenModelStatic } from './sso_token';
import type { StarredCommunityModelStatic } from './starred_community';
import type { SubscriptionModelStatic } from './subscription';
import type { TaggedThreadModelStatic } from './tagged_threads';
import type { TemplateModelStatic } from './template';
import type { ThreadModelStatic } from './thread';
import type { TopicModelStatic } from './topic';
import type { UserModelStatic } from './user';
import type { VoteModelStatic } from './vote';
import type { WebhookModelStatic } from './webhook';

export type Models = {
  Address: AddressModelStatic;
  Ban: BanModelStatic;
  Community: CommunityModelStatic;
  ChainNode: ChainNodeModelStatic;
  Contract: ContractModelStatic;
  ContractAbi: ContractAbiModelStatic;
  CommunityContract: CommunityContractModelStatic;
  CommunityContractTemplate: CommunityContractTemplateStatic;
  CommunityContractTemplateMetadata: CommunityContractTemplateMetadataStatic;
  Template: TemplateModelStatic;
  CommunitySnapshotSpaces: CommunitySnapshotSpaceModelStatic;
  Collaboration: CollaborationModelStatic;
  CommunityBanner: CommunityBannerModelStatic;
  DiscordBotConfig: DiscordBotConfigModelStatic;
  EvmEventSource: EvmEventSourceModelStatic;
  LastProcessedEvmBlock: LastProcessedEvmBlockModelStatic;
  LoginToken: LoginTokenModelStatic;
  Notification: NotificationModelStatic;
  NotificationCategory: NotificationCategoryModelStatic;
  NotificationsRead: NotificationsReadModelStatic;
  Comment: CommentModelStatic;
  Poll: PollModelStatic;
  Group: GroupModelStatic;
  Membership: MembershipModelStatic;
  Reaction: ReactionModelStatic;
  Thread: ThreadModelStatic;
  Topic: TopicModelStatic;
  Vote: VoteModelStatic;
  Profile: ProfileModelStatic;
  SsoToken: SsoTokenModelStatic;
  StarredCommunity: StarredCommunityModelStatic;
  SnapshotProposal: SnapshotProposalModelStatic;
  Subscription: SubscriptionModelStatic;
  SnapshotSpace: SnapshotSpaceModelStatic;
  TaggedThread: TaggedThreadModelStatic;
  User: UserModelStatic;
  Webhook: WebhookModelStatic;
};

export type DB = Models & {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
};

export * from './address';
export * from './ban';
export * from './chain_node';
export * from './collaboration';
export * from './comment';
export * from './community';
export * from './community_banner';
export * from './community_contract';
export * from './community_contract_metadata';
export * from './community_contract_template';
export * from './community_role';
export * from './community_snapshot_spaces';
export * from './contract';
export * from './contract_abi';
export * from './discord_bot_config';
export * from './evmEventSource';
export * from './group';
export * from './lastProcessedEvmBlock';
export * from './login_token';
export * from './membership';
export * from './notification';
export * from './notification_category';
export * from './notifications_read';
export * from './poll';
export * from './profile';
export * from './reaction';
export * from './role';
export * from './role_assignment';
export * from './snapshot_proposal';
export * from './snapshot_spaces';
export * from './sso_token';
export * from './starred_community';
export * from './subscription';
export * from './tagged_threads';
export * from './template';
export * from './thread';
export * from './topic';
export * from './types';
export * from './user';
export * from './vote';
export * from './webhook';
