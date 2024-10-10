/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as core from '../../../../core';
import { CreateThreadRequestDiscordMetaUser } from './CreateThreadRequestDiscordMetaUser';

export const CreateThreadRequestDiscordMeta = core.serialization.object({
  user: CreateThreadRequestDiscordMetaUser,
  channelId: core.serialization.property(
    'channel_id',
    core.serialization.string(),
  ),
  messageId: core.serialization.property(
    'message_id',
    core.serialization.string(),
  ),
});
