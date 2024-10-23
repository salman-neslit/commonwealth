/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';
export declare const UpdateCommentResponseThreadCollaboratorsItemUserProfileBackgroundImage: core.serialization.ObjectSchema<
  serializers.UpdateCommentResponseThreadCollaboratorsItemUserProfileBackgroundImage.Raw,
  CommonApi.UpdateCommentResponseThreadCollaboratorsItemUserProfileBackgroundImage
>;
export declare namespace UpdateCommentResponseThreadCollaboratorsItemUserProfileBackgroundImage {
  interface Raw {
    url?: string | null;
    imageBehavior?: string | null;
  }
}