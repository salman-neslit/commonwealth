/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../../../index";
import * as CommonApi from "../../../../api/index";
import * as core from "../../../../core";
export declare const UpdateGroupRequestRequirementsItemThresholdDataSourceOne: core.serialization.ObjectSchema<serializers.UpdateGroupRequestRequirementsItemThresholdDataSourceOne.Raw, CommonApi.UpdateGroupRequestRequirementsItemThresholdDataSourceOne>;
export declare namespace UpdateGroupRequestRequirementsItemThresholdDataSourceOne {
    interface Raw {
        source_type: "eth_native";
        evm_chain_id: number;
    }
}
