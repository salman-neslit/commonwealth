/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from "../../../index";
export declare type UpdateCommunityRequestGroupsItemRequirementsItem = CommonApi.UpdateCommunityRequestGroupsItemRequirementsItem.Threshold | CommonApi.UpdateCommunityRequestGroupsItemRequirementsItem.Allow;
export declare namespace UpdateCommunityRequestGroupsItemRequirementsItem {
    interface Threshold extends CommonApi.UpdateCommunityRequestGroupsItemRequirementsItemThreshold {
        rule: "threshold";
    }
    interface Allow extends CommonApi.UpdateCommunityRequestGroupsItemRequirementsItemAllow {
        rule: "allow";
    }
}
