/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../../../index";
import * as CommonApi from "../../../../api/index";
import * as core from "../../../../core";
export declare const UpdateCommunityResponseGroupsItemRequirementsItemThresholdDataSourceTokenSymbol: core.serialization.ObjectSchema<serializers.UpdateCommunityResponseGroupsItemRequirementsItemThresholdDataSourceTokenSymbol.Raw, CommonApi.UpdateCommunityResponseGroupsItemRequirementsItemThresholdDataSourceTokenSymbol>;
export declare namespace UpdateCommunityResponseGroupsItemRequirementsItemThresholdDataSourceTokenSymbol {
    interface Raw {
        source_type: "cosmos_native";
        cosmos_chain_id: string;
        token_symbol: string;
    }
}
