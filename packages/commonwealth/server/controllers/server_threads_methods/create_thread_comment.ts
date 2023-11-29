import moment from 'moment';
import { AppError } from '../../../../common-common/src/errors';
import {
  ChainNetwork,
  ChainType,
  NotificationCategories,
  ProposalType,
} from '../../../../common-common/src/types';
import { MixpanelCommunityInteractionEvent } from '../../../shared/analytics/types';
import { renderQuillDeltaToText } from '../../../shared/utils';
import { AddressInstance } from '../../models/address';
import { CommentAttributes } from '../../models/comment';
import { CommunityInstance } from '../../models/community';
import { UserInstance } from '../../models/user';
import { getCommentDepth } from '../../util/getCommentDepth';
import { parseUserMentions } from '../../util/parseUserMentions';
import { validateTopicGroupsMembership } from '../../util/requirementsModule/validateTopicGroupsMembership';
import { validateOwner } from '../../util/validateOwner';
import { TrackOptions } from '../server_analytics_methods/track';
import { EmitOptions } from '../server_notifications_methods/emit';
import { ServerThreadsController } from '../server_threads_controller';

const Errors = {
  ThreadNotFound: 'Thread not found',
  BanError: 'Ban error',
  InsufficientTokenBalance: 'Insufficient token balance',
  InvalidParent: 'Invalid parent',
  CantCommentOnReadOnly: 'Cannot comment when thread is read_only',
  NestingTooDeep: 'Comments can only be nested 8 levels deep',
  BalanceCheckFailed: 'Could not verify user token balance',
  ThreadArchived: 'Thread is archived',
  ParseMentionsFailed: 'Failed to parse mentions',
  FailedCreateComment: 'Failed to create comment',
};

const MAX_COMMENT_DEPTH = 8; // Sets the maximum depth of comments

export type CreateThreadCommentOptions = {
  user: UserInstance;
  address: AddressInstance;
  community: CommunityInstance;
  parentId: number;
  threadId: number;
  text: string;
  canvasAction?: any;
  canvasSession?: any;
  canvasHash?: any;
  discordMeta?: any;
};

export type CreateThreadCommentResult = [
  CommentAttributes,
  EmitOptions[],
  TrackOptions,
];

export async function __createThreadComment(
  this: ServerThreadsController,
  {
    user,
    address,
    community,
    parentId,
    threadId,
    text,
    canvasAction,
    canvasSession,
    canvasHash,
    discordMeta,
  }: CreateThreadCommentOptions,
): Promise<CreateThreadCommentResult> {
  // check if banned
  const [canInteract, banError] = await this.banCache.checkBan({
    communityId: community.id,
    address: address.address,
  });
  if (!canInteract) {
    throw new AppError(`${Errors.BanError}: ${banError}`);
  }

  // check if thread exists
  const thread = await this.models.Thread.findOne({
    where: { id: threadId },
  });
  if (!thread) {
    throw new AppError(Errors.ThreadNotFound);
  }

  // check if thread is archived
  if (thread.archived_at) {
    throw new AppError(Errors.ThreadArchived);
  }

  // check if thread is read-only
  if (thread.read_only) {
    throw new AppError(Errors.CantCommentOnReadOnly);
  }

  // get parent comment
  let parentComment;
  if (parentId) {
    // check that parent comment is in the same community
    parentComment = await this.models.Comment.findOne({
      where: {
        id: parentId,
        chain: community.id,
      },
      include: [this.models.Address],
    });
    if (!parentComment) {
      throw new AppError(Errors.InvalidParent);
    }
    // check to ensure comments are never nested more than max depth:
    const [commentDepthExceeded] = await getCommentDepth(
      this.models,
      parentComment,
      MAX_COMMENT_DEPTH,
    );
    if (commentDepthExceeded) {
      throw new AppError(Errors.NestingTooDeep);
    }
  }

  // check balance (bypass for admin)
  if (
    community &&
    (community.type === ChainType.Token ||
      community.network === ChainNetwork.Ethereum)
  ) {
    const isAdmin = await validateOwner({
      models: this.models,
      user,
      communityId: community.id,
      entity: thread,
      allowAdmin: true,
      allowGodMode: true,
    });
    if (!isAdmin) {
      const { isValid, message } = await validateTopicGroupsMembership(
        this.models,
        this.tokenBalanceCacheV1,
        this.tokenBalanceCacheV2,
        thread.topic_id,
        community,
        address,
      );
      if (!isValid) {
        throw new AppError(`${Errors.FailedCreateComment}: ${message}`);
      }
    }
  }

  const plaintext = (() => {
    try {
      return renderQuillDeltaToText(JSON.parse(decodeURIComponent(text)));
    } catch (e) {
      return decodeURIComponent(text);
    }
  })();

  // New comments get an empty version history initialized, which is passed
  // the comment's first version, formatted on the backend with timestamps
  const firstVersion = {
    timestamp: moment(),
    body: decodeURIComponent(text),
  };
  const version_history: string[] = [JSON.stringify(firstVersion)];
  const commentContent = {
    thread_id: `${threadId}`,
    text,
    plaintext,
    version_history,
    address_id: address.id,
    chain: community.id,
    parent_id: null,
    canvas_action: canvasAction,
    canvas_session: canvasSession,
    canvas_hash: canvasHash,
    discord_meta: discordMeta,
  };
  if (parentId) {
    Object.assign(commentContent, { parent_id: parentId });
  }

  const comment = await this.models.Comment.create(commentContent);

  // fetch attached objects to return to user
  const finalComment = await this.models.Comment.findOne({
    where: { id: comment.id },
    include: [this.models.Address],
  });

  const transaction = await this.models.sequelize.transaction();
  try {
    // auto-subscribe comment author to reactions & child comments
    await this.models.Subscription.create(
      {
        subscriber_id: user.id,
        category_id: NotificationCategories.NewReaction,
        chain_id: finalComment.chain || null,
        comment_id: finalComment.id,
        is_active: true,
      },
      { transaction },
    );
    await this.models.Subscription.create(
      {
        subscriber_id: user.id,
        category_id: NotificationCategories.NewComment,
        chain_id: finalComment.chain || null,
        comment_id: finalComment.id,
        is_active: true,
      },
      { transaction },
    );

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    await finalComment.destroy();
    throw err;
  }

  // grab mentions to notify tagged users
  const bodyText = decodeURIComponent(text);
  let mentionedAddresses;
  try {
    const mentions = parseUserMentions(bodyText);
    if (mentions && mentions.length > 0) {
      mentionedAddresses = await Promise.all(
        mentions.map(async (mention) => {
          const mentionedUser = await this.models.Address.findOne({
            where: {
              community_id: mention[0] || null,
              address: mention[1],
            },
            include: [this.models.User],
          });
          return mentionedUser;
        }),
      );
      mentionedAddresses = mentionedAddresses.filter((addr) => !!addr);
    }
  } catch (e) {
    throw new AppError(Errors.ParseMentionsFailed);
  }

  const excludedAddrs = (mentionedAddresses || []).map((addr) => addr.address);
  excludedAddrs.push(finalComment.Address.address);

  const rootNotifExcludeAddresses = [...excludedAddrs];
  if (parentComment && parentComment.Address) {
    rootNotifExcludeAddresses.push(parentComment.Address.address);
  }

  const root_title = thread.title || '';

  const allNotificationOptions: EmitOptions[] = [];

  // build notification for root thread
  allNotificationOptions.push({
    notification: {
      categoryId: NotificationCategories.NewComment,
      data: {
        created_at: new Date(),
        thread_id: threadId,
        root_title,
        root_type: ProposalType.Thread,
        comment_id: +finalComment.id,
        comment_text: finalComment.text,
        chain_id: finalComment.chain,
        author_address: finalComment.Address.address,
        author_chain: finalComment.Address.community_id,
      },
    },
    excludeAddresses: rootNotifExcludeAddresses,
  });

  // if child comment, build notification for parent author
  if (parentId && parentComment) {
    allNotificationOptions.push({
      notification: {
        categoryId: NotificationCategories.NewComment,
        data: {
          created_at: new Date(),
          thread_id: +threadId,
          root_title,
          root_type: ProposalType.Thread,
          comment_id: +finalComment.id,
          comment_text: finalComment.text,
          parent_comment_id: +parentId,
          parent_comment_text: parentComment.text,
          chain_id: finalComment.chain,
          author_address: finalComment.Address.address,
          author_chain: finalComment.Address.community_id,
        },
      },
      excludeAddresses: excludedAddrs,
    });

    // notify mentioned users if they have permission to view the originating forum
    if (mentionedAddresses?.length > 0) {
      mentionedAddresses.map((mentionedAddress) => {
        if (!mentionedAddress.User) {
          return; // some Addresses may be missing users, e.g. if the user removed the address
        }
        const shouldNotifyMentionedUser = true;
        if (shouldNotifyMentionedUser) {
          allNotificationOptions.push({
            notification: {
              categoryId: NotificationCategories.NewMention,
              data: {
                mentioned_user_id: mentionedAddress.User.id,
                created_at: new Date(),
                thread_id: +threadId,
                root_title,
                root_type: ProposalType.Thread,
                comment_id: +finalComment.id,
                comment_text: finalComment.text,
                chain_id: finalComment.chain,
                author_address: finalComment.Address.address,
                author_chain: finalComment.Address.community_id,
              },
            },
            excludeAddresses: [finalComment.Address.address],
          });
        }
      });
    }
  }

  // update author last saved (in background)
  address.last_active = new Date();
  address.save();

  // update proposal updated_at timestamp
  thread.last_commented_on = new Date();
  thread.save();

  const analyticsOptions = {
    event: MixpanelCommunityInteractionEvent.CREATE_COMMENT,
    community: community.id,
    userId: user.id,
    isCustomDomain: null,
  };

  return [finalComment.toJSON(), allNotificationOptions, analyticsOptions];
}
