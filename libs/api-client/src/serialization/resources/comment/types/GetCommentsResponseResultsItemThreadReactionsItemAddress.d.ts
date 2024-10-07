/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../../../index";
import * as CommonApi from "../../../../api/index";
import * as core from "../../../../core";
import { GetCommentsResponseResultsItemThreadReactionsItemAddressWalletId } from "./GetCommentsResponseResultsItemThreadReactionsItemAddressWalletId";
import { GetCommentsResponseResultsItemThreadReactionsItemAddressRole } from "./GetCommentsResponseResultsItemThreadReactionsItemAddressRole";
import { GetCommentsResponseResultsItemThreadReactionsItemAddressUser } from "./GetCommentsResponseResultsItemThreadReactionsItemAddressUser";
export declare const GetCommentsResponseResultsItemThreadReactionsItemAddress: core.serialization.ObjectSchema<serializers.GetCommentsResponseResultsItemThreadReactionsItemAddress.Raw, CommonApi.GetCommentsResponseResultsItemThreadReactionsItemAddress>;
export declare namespace GetCommentsResponseResultsItemThreadReactionsItemAddress {
    interface Raw {
        id?: number | null;
        address: string;
        community_id: string;
        user_id?: number | null;
        verification_token?: string | null;
        verification_token_expires?: string | null;
        verified?: string | null;
        last_active?: string | null;
        ghost_address?: boolean | null;
        wallet_id?: GetCommentsResponseResultsItemThreadReactionsItemAddressWalletId.Raw | null;
        block_info?: string | null;
        is_user_default?: boolean | null;
        role?: GetCommentsResponseResultsItemThreadReactionsItemAddressRole.Raw | null;
        is_banned?: boolean | null;
        hex?: string | null;
        User?: GetCommentsResponseResultsItemThreadReactionsItemAddressUser.Raw | null;
        created_at?: string | null;
        updated_at?: string | null;
    }
}
