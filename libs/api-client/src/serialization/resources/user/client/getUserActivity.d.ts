/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';
import { GetUserActivityResponseItem } from '../types/GetUserActivityResponseItem';
export declare const Response: core.serialization.Schema<
  serializers.user.getUserActivity.Response.Raw,
  CommonApi.GetUserActivityResponseItem[]
>;
export declare namespace Response {
  type Raw = GetUserActivityResponseItem.Raw[];
}