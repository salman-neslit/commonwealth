/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../index';

export interface CreateCommentResponseThreadCollaboratorsItemUser {
  id?: number;
  email?: string;
  isAdmin?: boolean;
  disableRichText?: boolean;
  emailVerified?: boolean;
  selectedCommunityId?: string;
  emailNotificationInterval?: CommonApi.CreateCommentResponseThreadCollaboratorsItemUserEmailNotificationInterval;
  promotionalEmailsEnabled?: boolean;
  isWelcomeOnboardFlowComplete?: boolean;
  profile: CommonApi.CreateCommentResponseThreadCollaboratorsItemUserProfile;
  xpPoints?: number;
  profileTags?: CommonApi.CreateCommentResponseThreadCollaboratorsItemUserProfileTagsItem[];
  apiKey?: CommonApi.CreateCommentResponseThreadCollaboratorsItemUserApiKey;
  createdAt?: Date;
  updatedAt?: Date;
}
