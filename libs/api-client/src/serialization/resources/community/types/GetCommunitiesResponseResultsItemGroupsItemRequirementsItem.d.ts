/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';
import { GetCommunitiesResponseResultsItemGroupsItemRequirementsItemAllow } from './GetCommunitiesResponseResultsItemGroupsItemRequirementsItemAllow';
import { GetCommunitiesResponseResultsItemGroupsItemRequirementsItemThreshold } from './GetCommunitiesResponseResultsItemGroupsItemRequirementsItemThreshold';
export declare const GetCommunitiesResponseResultsItemGroupsItemRequirementsItem: core.serialization.Schema<
  serializers.GetCommunitiesResponseResultsItemGroupsItemRequirementsItem.Raw,
  CommonApi.GetCommunitiesResponseResultsItemGroupsItemRequirementsItem
>;
export declare namespace GetCommunitiesResponseResultsItemGroupsItemRequirementsItem {
  type Raw =
    | GetCommunitiesResponseResultsItemGroupsItemRequirementsItem.Threshold
    | GetCommunitiesResponseResultsItemGroupsItemRequirementsItem.Allow;
  interface Threshold
    extends GetCommunitiesResponseResultsItemGroupsItemRequirementsItemThreshold.Raw {
    rule: 'threshold';
  }
  interface Allow
    extends GetCommunitiesResponseResultsItemGroupsItemRequirementsItemAllow.Raw {
    rule: 'allow';
  }
}