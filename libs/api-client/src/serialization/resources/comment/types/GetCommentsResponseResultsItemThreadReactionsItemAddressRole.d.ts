/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';
export declare const GetCommentsResponseResultsItemThreadReactionsItemAddressRole: core.serialization.Schema<
  serializers.GetCommentsResponseResultsItemThreadReactionsItemAddressRole.Raw,
  CommonApi.GetCommentsResponseResultsItemThreadReactionsItemAddressRole
>;
export declare namespace GetCommentsResponseResultsItemThreadReactionsItemAddressRole {
  type Raw = 'admin' | 'moderator' | 'member';
}