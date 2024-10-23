/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';
import { CreateGroupRequestRequirementsItemThresholdDataSourceOne } from './CreateGroupRequestRequirementsItemThresholdDataSourceOne';
import { CreateGroupRequestRequirementsItemThresholdDataSourceThree } from './CreateGroupRequestRequirementsItemThresholdDataSourceThree';
import { CreateGroupRequestRequirementsItemThresholdDataSourceTokenId } from './CreateGroupRequestRequirementsItemThresholdDataSourceTokenId';
import { CreateGroupRequestRequirementsItemThresholdDataSourceTokenSymbol } from './CreateGroupRequestRequirementsItemThresholdDataSourceTokenSymbol';
export declare const CreateGroupRequestRequirementsItemThresholdDataSource: core.serialization.Schema<
  serializers.CreateGroupRequestRequirementsItemThresholdDataSource.Raw,
  CommonApi.CreateGroupRequestRequirementsItemThresholdDataSource
>;
export declare namespace CreateGroupRequestRequirementsItemThresholdDataSource {
  type Raw =
    | CreateGroupRequestRequirementsItemThresholdDataSourceTokenId.Raw
    | CreateGroupRequestRequirementsItemThresholdDataSourceOne.Raw
    | CreateGroupRequestRequirementsItemThresholdDataSourceTokenSymbol.Raw
    | CreateGroupRequestRequirementsItemThresholdDataSourceThree.Raw;
}