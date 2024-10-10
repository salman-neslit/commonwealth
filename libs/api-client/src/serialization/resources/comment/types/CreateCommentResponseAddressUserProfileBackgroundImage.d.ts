/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';

export declare const CreateCommentResponseAddressUserProfileBackgroundImage: core.serialization.ObjectSchema<
  serializers.CreateCommentResponseAddressUserProfileBackgroundImage.Raw,
  CommonApi.CreateCommentResponseAddressUserProfileBackgroundImage
>;
export declare namespace CreateCommentResponseAddressUserProfileBackgroundImage {
  interface Raw {
    url?: string | null;
    imageBehavior?: string | null;
  }
}
