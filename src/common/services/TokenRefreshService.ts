import {
  ApolloLink,
  Observable,
  Operation,
  NextLink,
  FetchResult,
} from '@apollo/client/core';

import { API_ENDPOINT, ERROR_CODES } from '@/common/constants';
import tokenStore from '@/common/stores/token';

/**
 * Data required to process and progress the request to the next in the chain.
 */
interface Subscriber {
  next?: (result: FetchResult) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

/**
 * An Apollo request that's been queued.
 */
interface QueuedRequest extends Subscriber {
  operation: Operation;
  forward?: NextLink;
  subscriber?: Subscriber;
  observable?: Observable<FetchResult>;
}

/**
 * An an extension of the GraphQL errors object that includes an error code.
 */
interface GraphQLErrorExtension {
  code: string;
}

/**
 * A GraphQL error object.
 */
interface GraphQLError {
  extensions?: GraphQLErrorExtension;
  message: string;
}

/**
 * A collection of GraphQL error objects.
 */
interface GraphQLErrors {
  errors: GraphQLError[];
}

/**
 * Prior to sending a request to the GraphQL server, this link will determine
 * if the user's JWT token needs to be refreshed, and does so.
 */
export default class TokenRefreshService extends ApolloLink {
  // List of queued requests that need to be run after the token is fetched
  private queue: QueuedRequest[] = [];

  // True if the service is currently trying to fetch a refresh token
  private fetching = false;

  /**
   * Determine if the current state is valid for fetching data.
   *
   * @returns True if the token is valid for fetching data from the server.
   */
  static isValid(): boolean {
    if (tokenStore.isAnonymous.value) return true;
    if (tokenStore.isAuthenticated.value === false) return false;
    if (tokenStore.expiration.value < Date.now()) return false;
    return true;
  }

  static getErrorCodes(res: GraphQLErrors): string[] {
    if (!res.errors) return [];
    return res.errors.map(
      (x) => x?.extensions?.code ?? ERROR_CODES.UNKNOWN_ERROR
    );
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
    if (tokenStore.isStudent.value) {
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
    const errors = this.getErrorCodes(resJson);

    if (errors.includes(ERROR_CODES.INVALID_REFRESH_TOKEN)) {
      throw new Error(ERROR_CODES.INVALID_REFRESH_TOKEN);
    } else if (errors.length > 0 || !resJson.data) {
      throw new Error(errors[0]);
    }

    const data =
      resJson.data.userRefreshToken || resJson.data.studentRefreshToken || null;

    if (!data || !data.jwtToken) {
      throw new Error(ERROR_CODES.INVALID_REFRESH_TOKEN);
    }

    return data.jwtToken;
  }

  /**
   * Called by Apollo on every request.
   *
   * @param operation
   * @param forward
   * @returns
   */
  public request(
    operation: Operation,
    forward: NextLink
  ): Observable<FetchResult> | null {
    if (typeof forward !== 'function')
      throw new Error('Token Refresh Service is terminating link.');
    if (TokenRefreshService.isValid()) return forward(operation);

    const res = this.enqueue({ operation, forward });

    if (!this.fetching) {
      this.fetching = true;

      TokenRefreshService.fetchRefreshToken()
        .then((token) => {
          tokenStore.token.value = token;
        })
        .catch((e: unknown) => {
          tokenStore.token.value = null;

          if (!(e instanceof Error)) return;
          if (e.message !== ERROR_CODES.INVALID_REFRESH_TOKEN) {
            throw e;
          }
        })
        .finally(() => {
          this.fetching = false;
          this.run();
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
  private enqueue(request: QueuedRequest): Observable<FetchResult> {
    const req = { ...request };

    if (!req.observable) {
      req.observable = new Observable<FetchResult>((observer) => {
        this.queue.push(req);
        req.subscriber = req.subscriber || {};
        req.subscriber.next = req.next || observer.next.bind(observer);
        req.subscriber.error = req.error || observer.error.bind(observer);
        req.subscriber.complete =
          req.complete || observer.complete.bind(observer);
      });
    }

    return req.observable;
  }

  /**
   * Execute all of the pending requests and clear the queue.
   */
  private run() {
    this.queue.forEach((queuedRequest) => {
      if (!queuedRequest.forward) return;
      const req = queuedRequest.forward(queuedRequest.operation);
      if (!queuedRequest.subscriber) return;
      req.subscribe(queuedRequest.subscriber);
    });

    this.queue = [];
  }
}
