/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';
export declare const CreateCommunityResponseCommunityGroupsItemRequirementsItemAllowData: core.serialization.ObjectSchema<
  serializers.CreateCommunityResponseCommunityGroupsItemRequirementsItemAllowData.Raw,
  CommonApi.CreateCommunityResponseCommunityGroupsItemRequirementsItemAllowData
>;
export declare namespace CreateCommunityResponseCommunityGroupsItemRequirementsItemAllowData {
  interface Raw {
    allow: string[];
  }
}