/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as CommonApi from '../../../../api/index';
import * as core from '../../../../core';
import * as serializers from '../../../index';

export declare const GetCommunityResponseAddressesAddressesItemWalletId: core.serialization.Schema<
  serializers.GetCommunityResponseAddressesAddressesItemWalletId.Raw,
  CommonApi.GetCommunityResponseAddressesAddressesItemWalletId
>;
export declare namespace GetCommunityResponseAddressesAddressesItemWalletId {
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
