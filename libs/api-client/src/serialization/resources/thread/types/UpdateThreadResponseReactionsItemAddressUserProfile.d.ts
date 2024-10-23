/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';
import { UpdateThreadResponseReactionsItemAddressUserProfileBackgroundImage } from './UpdateThreadResponseReactionsItemAddressUserProfileBackgroundImage';
export declare const UpdateThreadResponseReactionsItemAddressUserProfile: core.serialization.ObjectSchema<
  serializers.UpdateThreadResponseReactionsItemAddressUserProfile.Raw,
  CommonApi.UpdateThreadResponseReactionsItemAddressUserProfile
>;
export declare namespace UpdateThreadResponseReactionsItemAddressUserProfile {
  interface Raw {
    name?: string | null;
    email?: string | null;
    website?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    slug?: string | null;
    socials?: string[] | null;
    background_image?: UpdateThreadResponseReactionsItemAddressUserProfileBackgroundImage.Raw | null;
  }
}