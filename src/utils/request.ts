import { defaultClient } from '@/services/apolloClient';
import {
  ApolloQueryResult,
  FetchResult,
  MutationOptions,
  OperationVariables,
  QueryOptions,
} from '@apollo/client';
import UserStore from '@/store/modules/user';

/**
 * Assert that the user is authenticated and performs a GraphQL mutation.
 *
 * @param options ApolloClient
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function authMutate<T = any, TVariables = OperationVariables>(
  options: MutationOptions<T, TVariables>,
): Promise<FetchResult<T>> {
  if (UserStore.jwtToken && UserStore.isExpired) {
    console.log('Expired!');
  }

  try {
    const result = await defaultClient.mutate(options);
    return Promise.resolve(result);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

/**
 * Assert that the user is authenticated and performs a GraphQL query.
 *
 * @param options Apollo query options.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function authQuery<T = any, TVariables = OperationVariables>(
  options: QueryOptions<TVariables>,
): Promise<ApolloQueryResult<T>> {
  try {
    const result = await defaultClient.query(options);
    return Promise.resolve(result);
  } catch (e) {
    console.log(e);
    throw e;
  }
}
