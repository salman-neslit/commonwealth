/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';

export declare const GetCommunitiesResponseResultsItemTopicsItemContestTopicsItem: core.serialization.ObjectSchema<
  serializers.GetCommunitiesResponseResultsItemTopicsItemContestTopicsItem.Raw,
  CommonApi.GetCommunitiesResponseResultsItemTopicsItemContestTopicsItem
>;
export declare namespace GetCommunitiesResponseResultsItemTopicsItemContestTopicsItem {
  interface Raw {
    contest_address: string;
    topic_id: number;
    created_at: string;
  }
}
