/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';

export declare const GetMembersRequestOrderBy: core.serialization.Schema<
  serializers.GetMembersRequestOrderBy.Raw,
  CommonApi.GetMembersRequestOrderBy
>;
export declare namespace GetMembersRequestOrderBy {
  type Raw = 'last_active' | 'name';
}
