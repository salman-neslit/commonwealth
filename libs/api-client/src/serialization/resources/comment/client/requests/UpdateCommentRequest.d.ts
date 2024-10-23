/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../../api/index';
import * as core from '../../../../../core';
import * as serializers from '../../../../index';
export declare const UpdateCommentRequest: core.serialization.Schema<
  serializers.UpdateCommentRequest.Raw,
  CommonApi.UpdateCommentRequest
>;
export declare namespace UpdateCommentRequest {
  interface Raw {
    comment_id: number;
    text: string;
  }
}