/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';

export declare const UpdateCommunityResponseGroupsItemRequirementsItemThresholdDataSourceTokenIdSourceType: core.serialization.Schema<
  serializers.UpdateCommunityResponseGroupsItemRequirementsItemThresholdDataSourceTokenIdSourceType.Raw,
  CommonApi.UpdateCommunityResponseGroupsItemRequirementsItemThresholdDataSourceTokenIdSourceType
>;
export declare namespace UpdateCommunityResponseGroupsItemRequirementsItemThresholdDataSourceTokenIdSourceType {
  type Raw = 'erc20' | 'erc721' | 'erc1155' | 'spl';
}
