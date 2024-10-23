/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as core from '../../../../core';
import { CreateThreadResponseAddressUserApiKey } from './CreateThreadResponseAddressUserApiKey';
import { CreateThreadResponseAddressUserEmailNotificationInterval } from './CreateThreadResponseAddressUserEmailNotificationInterval';
import { CreateThreadResponseAddressUserProfile } from './CreateThreadResponseAddressUserProfile';
import { CreateThreadResponseAddressUserProfileTagsItem } from './CreateThreadResponseAddressUserProfileTagsItem';
export const CreateThreadResponseAddressUser = core.serialization.object({
  id: core.serialization.number().optional(),
  email: core.serialization.string().optional(),
  isAdmin: core.serialization.boolean().optional(),
  disableRichText: core.serialization.boolean().optional(),
  emailVerified: core.serialization.boolean().optional(),
  selectedCommunityId: core.serialization.property(
    'selected_community_id',
    core.serialization.string().optional(),
  ),
  emailNotificationInterval:
    CreateThreadResponseAddressUserEmailNotificationInterval.optional(),
  promotionalEmailsEnabled: core.serialization.property(
    'promotional_emails_enabled',
    core.serialization.boolean().optional(),
  ),
  isWelcomeOnboardFlowComplete: core.serialization.property(
    'is_welcome_onboard_flow_complete',
    core.serialization.boolean().optional(),
  ),
  profile: CreateThreadResponseAddressUserProfile,
  xpPoints: core.serialization.property(
    'xp_points',
    core.serialization.number().optional(),
  ),
  profileTags: core.serialization.property(
    'ProfileTags',
    core.serialization
      .list(CreateThreadResponseAddressUserProfileTagsItem)
      .optional(),
  ),
  apiKey: core.serialization.property(
    'ApiKey',
    CreateThreadResponseAddressUserApiKey.optional(),
  ),
  createdAt: core.serialization.property(
    'created_at',
    core.serialization.date().optional(),
  ),
  updatedAt: core.serialization.property(
    'updated_at',
    core.serialization.date().optional(),
  ),
});