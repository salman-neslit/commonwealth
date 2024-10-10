/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';
import { UpdateCommentResponseDiscordMetaUser } from './UpdateCommentResponseDiscordMetaUser';

export declare const UpdateCommentResponseDiscordMeta: core.serialization.ObjectSchema<
  serializers.UpdateCommentResponseDiscordMeta.Raw,
  CommonApi.UpdateCommentResponseDiscordMeta
>;
export declare namespace UpdateCommentResponseDiscordMeta {
  interface Raw {
    user: UpdateCommentResponseDiscordMetaUser.Raw;
    channel_id: string;
    message_id: string;
  }
}
