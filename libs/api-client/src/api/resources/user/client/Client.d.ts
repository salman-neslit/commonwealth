/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as core from '../../../../core';
import * as environments from '../../../../environments';
import * as CommonApi from '../../../index';
export declare namespace User {
  interface Options {
    environment?: core.Supplier<environments.CommonApiEnvironment | string>;
    apiKey: core.Supplier<string>;
    /** Override the address header */
    address?: core.Supplier<string | undefined>;
  }
  interface RequestOptions {
    /** The maximum time to wait for a response in seconds. */
    timeoutInSeconds?: number;
    /** The number of times to retry the request. Defaults to 2. */
    maxRetries?: number;
    /** A hook to abort the request. */
    abortSignal?: AbortSignal;
    /** Override the address header */
    address?: string | undefined;
  }
}
export declare class User {
  protected readonly _options: User.Options;
  constructor(_options: User.Options);
  /**
   * @param {CommonApi.GetUserActivityRequest} request
   * @param {User.RequestOptions} requestOptions - Request-specific configuration.
   *
   * @example
   *     await client.user.getUserActivity()
   */
  getUserActivity(
    request?: CommonApi.GetUserActivityRequest,
    requestOptions?: User.RequestOptions,
  ): Promise<CommonApi.GetUserActivityResponseItem[]>;
  /**
   * @param {User.RequestOptions} requestOptions - Request-specific configuration.
   *
   * @example
   *     await client.user.getNewContent()
   */
  getNewContent(
    requestOptions?: User.RequestOptions,
  ): Promise<CommonApi.GetNewContentResponse>;
  protected _getCustomAuthorizationHeaders(): Promise<{
    'x-api-key': string;
  }>;
}