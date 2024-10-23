/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';
import { CreateCommentResponseThreadAddressUserApiKey } from './CreateCommentResponseThreadAddressUserApiKey';
import { CreateCommentResponseThreadAddressUserEmailNotificationInterval } from './CreateCommentResponseThreadAddressUserEmailNotificationInterval';
import { CreateCommentResponseThreadAddressUserProfile } from './CreateCommentResponseThreadAddressUserProfile';
import { CreateCommentResponseThreadAddressUserProfileTagsItem } from './CreateCommentResponseThreadAddressUserProfileTagsItem';
export declare const CreateCommentResponseThreadAddressUser: core.serialization.ObjectSchema<
  serializers.CreateCommentResponseThreadAddressUser.Raw,
  CommonApi.CreateCommentResponseThreadAddressUser
>;
export declare namespace CreateCommentResponseThreadAddressUser {
  interface Raw {
    id?: number | null;
    email?: string | null;
    isAdmin?: boolean | null;
    disableRichText?: boolean | null;
    emailVerified?: boolean | null;
    selected_community_id?: string | null;
    emailNotificationInterval?: CreateCommentResponseThreadAddressUserEmailNotificationInterval.Raw | null;
    promotional_emails_enabled?: boolean | null;
    is_welcome_onboard_flow_complete?: boolean | null;
    profile: CreateCommentResponseThreadAddressUserProfile.Raw;
    xp_points?: number | null;
    ProfileTags?:
      | CreateCommentResponseThreadAddressUserProfileTagsItem.Raw[]
      | null;
    ApiKey?: CreateCommentResponseThreadAddressUserApiKey.Raw | null;
    created_at?: string | null;
    updated_at?: string | null;
  }
}