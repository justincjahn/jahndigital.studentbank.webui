import { ApolloClient } from '@apollo/client/core';

/**
 * Abstract object that requires an ApolloClient object to be passed into the constructor.
 */
export default abstract class ApolloServiceAbstract {
  protected client: ApolloClient<unknown>;

  constructor(client: ApolloClient<unknown>) {
    this.client = client;
  }
}
