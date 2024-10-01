/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../../../index";
import * as CommonApi from "../../../../api/index";
import * as core from "../../../../core";
export declare const UpdateThreadRequestCollaborators: core.serialization.ObjectSchema<serializers.UpdateThreadRequestCollaborators.Raw, CommonApi.UpdateThreadRequestCollaborators>;
export declare namespace UpdateThreadRequestCollaborators {
    interface Raw {
        toAdd?: number[] | null;
        toRemove?: number[] | null;
    }
}
