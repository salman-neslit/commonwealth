/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../../../index";
import * as CommonApi from "../../../../api/index";
import * as core from "../../../../core";
export declare const UpdateGroupResponseRequirementsItemThresholdDataSourceOne: core.serialization.ObjectSchema<serializers.UpdateGroupResponseRequirementsItemThresholdDataSourceOne.Raw, CommonApi.UpdateGroupResponseRequirementsItemThresholdDataSourceOne>;
export declare namespace UpdateGroupResponseRequirementsItemThresholdDataSourceOne {
    interface Raw {
        source_type: "eth_native";
        evm_chain_id: number;
    }
}
