/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';
import { UpdateCommunityResponseGroupsItemRequirementsItemThresholdDataSource } from './UpdateCommunityResponseGroupsItemRequirementsItemThresholdDataSource';
export declare const UpdateCommunityResponseGroupsItemRequirementsItemThresholdData: core.serialization.ObjectSchema<
  serializers.UpdateCommunityResponseGroupsItemRequirementsItemThresholdData.Raw,
  CommonApi.UpdateCommunityResponseGroupsItemRequirementsItemThresholdData
>;
export declare namespace UpdateCommunityResponseGroupsItemRequirementsItemThresholdData {
  interface Raw {
    threshold: string;
    source: UpdateCommunityResponseGroupsItemRequirementsItemThresholdDataSource.Raw;
  }
}