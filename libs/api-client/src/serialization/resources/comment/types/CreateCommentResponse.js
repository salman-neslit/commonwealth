/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as core from '../../../../core';
import { CreateCommentResponseAddress } from './CreateCommentResponseAddress';
import { CreateCommentResponseCommentVersionHistoriesItem } from './CreateCommentResponseCommentVersionHistoriesItem';
import { CreateCommentResponseDiscordMeta } from './CreateCommentResponseDiscordMeta';
import { CreateCommentResponseReaction } from './CreateCommentResponseReaction';
import { CreateCommentResponseSearch } from './CreateCommentResponseSearch';
import { CreateCommentResponseThread } from './CreateCommentResponseThread';
export const CreateCommentResponse = core.serialization.object({
  id: core.serialization.number().optional(),
  threadId: core.serialization.property(
    'thread_id',
    core.serialization.number(),
  ),
  addressId: core.serialization.property(
    'address_id',
    core.serialization.number(),
  ),
  text: core.serialization.string(),
  plaintext: core.serialization.string(),
  parentId: core.serialization.property(
    'parent_id',
    core.serialization.string().optional(),
  ),
  contentUrl: core.serialization.property(
    'content_url',
    core.serialization.string().optional(),
  ),
  canvasSignedData: core.serialization.property(
    'canvas_signed_data',
    core.serialization.string().optional(),
  ),
  canvasMsgId: core.serialization.property(
    'canvas_msg_id',
    core.serialization.string().optional(),
  ),
  createdBy: core.serialization.property(
    'created_by',
    core.serialization.string().optional(),
  ),
  createdAt: core.serialization.property(
    'created_at',
    core.serialization.date().optional(),
  ),
  updatedAt: core.serialization.property(
    'updated_at',
    core.serialization.date().optional(),
  ),
  deletedAt: core.serialization.property(
    'deleted_at',
    core.serialization.date().optional(),
  ),
  markedAsSpamAt: core.serialization.property(
    'marked_as_spam_at',
    core.serialization.date().optional(),
  ),
  discordMeta: core.serialization.property(
    'discord_meta',
    CreateCommentResponseDiscordMeta.optional(),
  ),
  reactionCount: core.serialization.property(
    'reaction_count',
    core.serialization.number(),
  ),
  reactionWeightsSum: core.serialization.property(
    'reaction_weights_sum',
    core.serialization.number().optional(),
  ),
  search: CreateCommentResponseSearch,
  address: core.serialization.property(
    'Address',
    CreateCommentResponseAddress.optional(),
  ),
  thread: core.serialization.property(
    'Thread',
    CreateCommentResponseThread.optional(),
  ),
  reaction: core.serialization.property(
    'Reaction',
    CreateCommentResponseReaction.optional(),
  ),
  commentVersionHistories: core.serialization.property(
    'CommentVersionHistories',
    core.serialization
      .list(CreateCommentResponseCommentVersionHistoriesItem)
      .optional(),
  ),
  communityId: core.serialization.property(
    'community_id',
    core.serialization.string(),
  ),
});
