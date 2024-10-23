/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';
export declare const UpdateCommentResponseThreadCollaboratorsItemRole: core.serialization.Schema<
  serializers.UpdateCommentResponseThreadCollaboratorsItemRole.Raw,
  CommonApi.UpdateCommentResponseThreadCollaboratorsItemRole
>;
export declare namespace UpdateCommentResponseThreadCollaboratorsItemRole {
  type Raw = 'admin' | 'moderator' | 'member';
}