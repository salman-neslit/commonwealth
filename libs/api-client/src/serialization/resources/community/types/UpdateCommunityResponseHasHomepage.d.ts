/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';
export declare const UpdateCommunityResponseHasHomepage: core.serialization.Schema<
  serializers.UpdateCommunityResponseHasHomepage.Raw,
  CommonApi.UpdateCommunityResponseHasHomepage
>;
export declare namespace UpdateCommunityResponseHasHomepage {
  type Raw = 'true' | 'false';
}