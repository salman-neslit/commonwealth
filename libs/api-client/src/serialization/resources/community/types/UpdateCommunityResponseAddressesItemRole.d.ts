/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';

export declare const UpdateCommunityResponseAddressesItemRole: core.serialization.Schema<
  serializers.UpdateCommunityResponseAddressesItemRole.Raw,
  CommonApi.UpdateCommunityResponseAddressesItemRole
>;
export declare namespace UpdateCommunityResponseAddressesItemRole {
  type Raw = 'admin' | 'moderator' | 'member';
}
