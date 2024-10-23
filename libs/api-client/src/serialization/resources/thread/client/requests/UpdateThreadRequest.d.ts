/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../../api/index';
import * as core from '../../../../../core';
import * as serializers from '../../../../index';
import { UpdateThreadRequestCollaborators } from '../../types/UpdateThreadRequestCollaborators';
export declare const UpdateThreadRequest: core.serialization.Schema<
  serializers.UpdateThreadRequest.Raw,
  CommonApi.UpdateThreadRequest
>;
export declare namespace UpdateThreadRequest {
  interface Raw {
    thread_id: number;
    body?: string | null;
    title?: string | null;
    topic_id?: number | null;
    stage?: string | null;
    url?: string | null;
    locked?: boolean | null;
    pinned?: boolean | null;
    archived?: boolean | null;
    spam?: boolean | null;
    collaborators?: UpdateThreadRequestCollaborators.Raw | null;
    canvas_signed_data?: string | null;
    canvas_msg_id?: string | null;
  }
}