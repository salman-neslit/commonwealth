/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';
export declare const CreateGroupResponseHasHomepage: core.serialization.Schema<
  serializers.CreateGroupResponseHasHomepage.Raw,
  CommonApi.CreateGroupResponseHasHomepage
>;
export declare namespace CreateGroupResponseHasHomepage {
  type Raw = 'true' | 'false';
}