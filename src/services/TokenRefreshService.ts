import {
  ApolloLink,
  Observable,
  Operation,
  NextLink,
  FetchResult,
} from '@apollo/client/core';

import { API_ENDPOINT } from '@/constants';
import userStore from '../stores/user';

interface Subscriber {
  next?: (result: FetchResult) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

interface QueuedRequest extends Subscriber {
  operation: Operation;
  forward?: NextLink;
  subscriber?: Subscriber;
  observable?: Observable<FetchResult>;
}

/**
 * Prior to sending a request to the GraphQL server, this link will determine if the user's JWT token
 * needs to be refreshed, and does so.
 */
export default class TokenRefreshService extends ApolloLink {
  // List of queued requests that need to be run after the token is fetched
  private _queue: QueuedRequest[] = [];

  // True if the service is currently trying to fetch a refresh token
  private _fetching = false;

  /**
   * Determine if the current state is valid for fetching data.
   *
   * @returns True if the token is valid for fetching data from the server.
   */
  static isValid(): boolean {
    if (userStore.isAnonymous.value) return true;
    if (!userStore.isAuthenticated.value) return false;
    if (userStore.tokenExpiration.value < Date.now()) return false;
    return true;
  }

  /**
   * Fetch the refresh token from the API.
   *
   * @returns
   */
  static async fetchRefreshToken(): Promise<string> {
    // @note Refresh tokens are stored in an HttpOnly cookie.
    let body = `
      mutation userRefreshToken {
        userRefreshToken {
          jwtToken
        }
      }
    `;

    let operation = 'userRefreshToken';

    if (userStore.isStudent.value) {
      body = `
        mutation studentRefreshToken {
          studentRefreshToken {
            jwtToken
          }
        }
      `;

      operation = 'studentRefreshToken';
    }

    const res = await fetch(API_ENDPOINT, {
      method: 'POST',

      credentials: 'include',

      cache: 'no-cache',

      mode: 'cors',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        operationName: operation,
        query: body,
        variables: {},
      }),
    });

    const resJson = await res.json();
    if (!resJson.data) throw new Error('No data returned by server.');

    const data = resJson.data.userRefreshToken || resJson.data.studentRefreshToken || null;
    if (!data || !data.jwtToken) throw new Error('No token found in response.');

    return data.jwtToken;
  }

  /**
   * Called by Apollo on every request.
   *
   * @param operation
   * @param forward
   * @returns
   */
  public request(operation: Operation, forward: NextLink): Observable<FetchResult> | null {
    if (typeof forward !== 'function') throw new Error('Token Refresh Service is terminating link.');
    if (TokenRefreshService.isValid()) return forward(operation);

    const res = this._enqueue({ operation, forward });

    if (!this._fetching) {
      this._fetching = true;

      TokenRefreshService.fetchRefreshToken().then((token) => {
        userStore.setToken(token);
      }).catch((e) => {
        console.warn('Your refresh token is invalid.  Please login again.');
        console.error(e);
        userStore.setToken(null);
      }).finally(() => {
        this._fetching = false;
        this._run();
      });
    }

    return res;
  }

  /**
   * Add a new request to the queue.
   *
   * @param request
   * @returns
   */
  private _enqueue(request: QueuedRequest): Observable<FetchResult> {
    const req = { ...request };

    if (!req.observable) {
      req.observable = new Observable<FetchResult>((observer) => {
        this._queue.push(req);
        req.subscriber = req.subscriber || {};
        req.subscriber.next = req.next || observer.next.bind(observer);
        req.subscriber.error = req.error || observer.error.bind(observer);
        req.subscriber.complete = req.complete || observer.complete.bind(observer);
      });
    }

    return req.observable;
  }

  /**
   * Execute all of the pending requests and clear the queue.
   */
  private _run() {
    this._queue.forEach((queuedRequest) => {
      if (!queuedRequest.forward) return;
      const req = queuedRequest.forward(queuedRequest.operation);
      if (!queuedRequest.subscriber) return;
      req.subscribe(queuedRequest.subscriber);
    });

    this._queue = [];
  }
}
