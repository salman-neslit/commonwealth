/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../index';
export interface UpdateCommunityRequestAddressesItemUser {
  id?: number;
  email?: string;
  isAdmin?: boolean;
  disableRichText?: boolean;
  emailVerified?: boolean;
  selectedCommunityId?: string;
  emailNotificationInterval?: CommonApi.UpdateCommunityRequestAddressesItemUserEmailNotificationInterval;
  promotionalEmailsEnabled?: boolean;
  isWelcomeOnboardFlowComplete?: boolean;
  profile: CommonApi.UpdateCommunityRequestAddressesItemUserProfile;
  xpPoints?: number;
  profileTags?: CommonApi.UpdateCommunityRequestAddressesItemUserProfileTagsItem[];
  apiKey?: CommonApi.UpdateCommunityRequestAddressesItemUserApiKey;
  createdAt?: Date;
  updatedAt?: Date;
}