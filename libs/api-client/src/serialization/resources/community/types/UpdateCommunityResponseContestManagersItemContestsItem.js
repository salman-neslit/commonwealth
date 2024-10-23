/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as core from '../../../../core';
import { UpdateCommunityResponseContestManagersItemContestsItemActionsItem } from './UpdateCommunityResponseContestManagersItemContestsItemActionsItem';
import { UpdateCommunityResponseContestManagersItemContestsItemScoreItem } from './UpdateCommunityResponseContestManagersItemContestsItemScoreItem';
export const UpdateCommunityResponseContestManagersItemContestsItem =
  core.serialization.object({
    contestAddress: core.serialization.property(
      'contest_address',
      core.serialization.string(),
    ),
    contestId: core.serialization.property(
      'contest_id',
      core.serialization.number(),
    ),
    startTime: core.serialization.property(
      'start_time',
      core.serialization.date(),
    ),
    endTime: core.serialization.property('end_time', core.serialization.date()),
    scoreUpdatedAt: core.serialization.property(
      'score_updated_at',
      core.serialization.date().optional(),
    ),
    score: core.serialization
      .list(UpdateCommunityResponseContestManagersItemContestsItemScoreItem)
      .optional(),
    actions: core.serialization
      .list(UpdateCommunityResponseContestManagersItemContestsItemActionsItem)
      .optional(),
  });