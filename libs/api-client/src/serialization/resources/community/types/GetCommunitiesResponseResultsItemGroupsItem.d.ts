/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../../../index";
import * as CommonApi from "../../../../api/index";
import * as core from "../../../../core";
import { GetCommunitiesResponseResultsItemGroupsItemMetadata } from "./GetCommunitiesResponseResultsItemGroupsItemMetadata";
import { GetCommunitiesResponseResultsItemGroupsItemRequirementsItem } from "./GetCommunitiesResponseResultsItemGroupsItemRequirementsItem";
export declare const GetCommunitiesResponseResultsItemGroupsItem: core.serialization.ObjectSchema<serializers.GetCommunitiesResponseResultsItemGroupsItem.Raw, CommonApi.GetCommunitiesResponseResultsItemGroupsItem>;
export declare namespace GetCommunitiesResponseResultsItemGroupsItem {
    interface Raw {
        id?: number | null;
        community_id: string;
        metadata: GetCommunitiesResponseResultsItemGroupsItemMetadata.Raw;
        requirements: GetCommunitiesResponseResultsItemGroupsItemRequirementsItem.Raw[];
        is_system_managed?: boolean | null;
        created_at?: string | null;
        updated_at?: string | null;
    }
}
