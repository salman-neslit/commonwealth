/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';

export declare const CreateCommentResponseThreadReactionsItemAddressWalletId: core.serialization.Schema<
  serializers.CreateCommentResponseThreadReactionsItemAddressWalletId.Raw,
  CommonApi.CreateCommentResponseThreadReactionsItemAddressWalletId
>;
export declare namespace CreateCommentResponseThreadReactionsItemAddressWalletId {
  type Raw =
    | 'magic'
    | 'polkadot'
    | 'metamask'
    | 'walletconnect'
    | 'keplr-ethereum'
    | 'keplr'
    | 'leap'
    | 'near'
    | 'terrastation'
    | 'terra-walletconnect'
    | 'cosm-metamask'
    | 'phantom'
    | 'coinbase';
}
