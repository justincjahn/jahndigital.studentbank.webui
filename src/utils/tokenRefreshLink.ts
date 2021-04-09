/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ApolloLink,
  Observable,
  Operation,
  NextLink,
  FetchResult,
} from '@apollo/client/core';

import { OperationQueuing } from './queuing';

/**
 * Callback which receives a fresh token from Response
 */
export type FetchAccessToken = (...args: any[]) => Promise<Response>;

/**
 * Callback that allows callers to persist tokens in memory for use in subsequent
 * requests.
 */
export type HandleFetch<AccessTokenPayloadType> = (accessTokenPayload: AccessTokenPayloadType) => void;

/**
 * Callback that allows parse and extract the token from server response.
 */
export type HandleResponse = (operation: Operation, accessTokenField: string) => any;

/**
 * Callback thats fired when an error occurs during token refresh.
 */
export type HandleError = (err: Error) => void;

/**
 * Callback that determines if there is a valid token or none at all (guest).
 */
export type IsTokenValidOrUndefined = (...args: any[]) => boolean;

/**
 * Options object passed to the TokenRefreshLink<T> constructor.
 */
export interface Options<AccessTokenPayloadType> {
  /**
   * This is a name of access token field in response.
   * In some scenarios we want to pass additional payload with access token,
   * i.e. new refresh token, so this field could be the object's name.
   *
   * Default: "access_token".
   */
  accessTokenField?: string;

  /**
   * Indicates the current state of access token expiration. If token not yet expired or user
   * doesn't have a token (guest) true should be returned.
   */
  isTokenValidOrUndefined: IsTokenValidOrUndefined;

  /**
   * When the new access token is retrieved, an app might persist it in memory (consider avoiding
   * local storage) for use in subsequent requests.
   */
  handleFetch: HandleFetch<AccessTokenPayloadType>;

  /**
   * Callback which receives a fresh token from Response
   */
  fetchAccessToken: FetchAccessToken;

  /**
   * Function to parse and extract the token from server response
   */
  handleResponse: HandleResponse;

  /**
   * Token fetch error callback. Allows to run additional actions like logout. Don't forget to
   * handle Error if you are using this option
   */
  handleError?: HandleError;
}

/**
 * Hooks into Apollo network calls to determine if the user's access token is valid and
 * queries handler functions to refresh it.
 *
 * Adapted from https://github.com/newsiberian/apollo-link-token-refresh
 *
 * TODO: This can be simplified for this use-case.
 */
export class TokenRefreshLink<AccessTokenPayloadType = string> extends ApolloLink {
  /**
   * The name of the field from the result.
   */
  private accessTokenField: string;

  /**
   * Function that determines if the token is valid.
   */
  private isTokenValidOrUndefined: IsTokenValidOrUndefined;

  /**
   * When the new access token is retrieved, an app might persist it in memory (consider avoiding
   * local storage) for use in subsequent requests.
   */
  private handleFetch: HandleFetch<AccessTokenPayloadType>;

  /**
   * Callback which receives a fresh token from Response
   */
  private fetchAccessToken: FetchAccessToken;

  /**
   * Function to parse and extract the token from server response
   */
  private handleResponse: HandleResponse;

  /**
   * Token fetch error callback. Allows to run additional actions like logout. Don't forget to
   * handle Error if you are using this option
   */
  private handleError: HandleError;

  /**
   * True when a refresh token is currently being fetched.
   */
  private fetching: boolean;

  /**
   * A queue of Apollo operations waiting on a new token.
   */
  private queue: OperationQueuing;

  /**
   * @param params
   */
  constructor(params: Options<AccessTokenPayloadType>) {
    super();

    this.accessTokenField = (params.accessTokenField) || 'access_token';
    this.isTokenValidOrUndefined = params.isTokenValidOrUndefined;
    this.fetchAccessToken = params.fetchAccessToken;
    this.handleFetch = params.handleFetch;
    this.handleResponse = params.handleResponse;

    this.handleError = (typeof params.handleError === 'function')
      ? params.handleError
      : (err) => console.error(err);

    this.fetching = false;
    this.queue = new OperationQueuing();
  }

  /**
   * Called by Apollo when a request needs to be made.
   *
   * @param operation The Apollo operation requested.
   * @param forward The next link in the chain if any.
   * @returns
   */
  public request(operation: Operation, forward: NextLink): Observable<FetchResult> | null {
    if (typeof forward !== 'function') {
      throw new Error('Token Refresh Link: cannot be a terminating link.');
    }

    // Check to ensure the token is valid
    if (this.isTokenValidOrUndefined()) return forward(operation);

    // Enqueue the request while we attempt to fetch a new token
    const res = this.queue.enqueueRequest({ operation, forward });

    if (!this.fetching) {
      this.fetching = true;
      this.fetchAccessToken()
        .then(this.handleResponse(operation, this.accessTokenField))
        .then((body) => {
          const token = this.extractToken(body);

          if (!token) {
            throw new Error('Token Refresh Link: Unable to retrieve new access token');
          }

          return token;
        })
        .then(this.handleFetch)
        .catch(this.handleError)
        .finally(() => {
          this.fetching = false;

          // Attempt the original request and any others that came in
          this.queue.consumeQueue();
        });
    }

    return res;
  }

  /**
   * An attempt to extract token from body.data. This allows us to use apollo query
   * for auth token refreshing.
   *
   * @param body {Object} response body
   * @return {string} access token
   */
  private extractToken(body: any): AccessTokenPayloadType {
    if (body.data) {
      return body.data[this.accessTokenField];
    }

    return body[this.accessTokenField];
  }
}
