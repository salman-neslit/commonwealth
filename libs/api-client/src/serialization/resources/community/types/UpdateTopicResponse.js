/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as core from '../../../../core';
import { UpdateTopicResponseTopic } from './UpdateTopicResponseTopic';
export const UpdateTopicResponse = core.serialization.object({
  topic: UpdateTopicResponseTopic,
  userId: core.serialization.property('user_id', core.serialization.number()),
});