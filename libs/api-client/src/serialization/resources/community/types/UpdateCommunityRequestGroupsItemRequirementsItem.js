/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as core from '../../../../core';
import { UpdateCommunityRequestGroupsItemRequirementsItemAllow } from './UpdateCommunityRequestGroupsItemRequirementsItemAllow';
import { UpdateCommunityRequestGroupsItemRequirementsItemThreshold } from './UpdateCommunityRequestGroupsItemRequirementsItemThreshold';
export const UpdateCommunityRequestGroupsItemRequirementsItem =
  core.serialization
    .union('rule', {
      threshold: UpdateCommunityRequestGroupsItemRequirementsItemThreshold,
      allow: UpdateCommunityRequestGroupsItemRequirementsItemAllow,
    })
    .transform({
      transform: (value) => value,
      untransform: (value) => value,
    });