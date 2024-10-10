/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as core from '../../../../core';
import { CreateCommentRequestDiscordMetaUser } from './CreateCommentRequestDiscordMetaUser';

export const CreateCommentRequestDiscordMeta = core.serialization.object({
  user: CreateCommentRequestDiscordMetaUser,
  channelId: core.serialization.property(
    'channel_id',
    core.serialization.string(),
  ),
  messageId: core.serialization.property(
    'message_id',
    core.serialization.string(),
  ),
});
