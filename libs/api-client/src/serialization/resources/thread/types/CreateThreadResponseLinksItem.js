/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as core from '../../../../core';
import { CreateThreadResponseLinksItemSource } from './CreateThreadResponseLinksItemSource';
export const CreateThreadResponseLinksItem = core.serialization.object({
  source: CreateThreadResponseLinksItemSource,
  identifier: core.serialization.string(),
  title: core.serialization.string().optional(),
});