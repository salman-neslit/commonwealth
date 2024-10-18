/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';
export declare const CreateCommentResponseThreadCollaboratorsItemRole: core.serialization.Schema<
  serializers.CreateCommentResponseThreadCollaboratorsItemRole.Raw,
  CommonApi.CreateCommentResponseThreadCollaboratorsItemRole
>;
export declare namespace CreateCommentResponseThreadCollaboratorsItemRole {
  type Raw = 'admin' | 'moderator' | 'member';
}
