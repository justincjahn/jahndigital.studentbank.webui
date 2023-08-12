import type {
  UsersQuery,
  UsersQueryVariables,
  NewUserMutation,
  NewUserMutationVariables,
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from '@/generated/graphql';

import gqlUsers from '@/common/graphql/queries/users.gql';
import gqlUpdateUser from '@/common/graphql/mutations/userUpdate.gql';
import gqlNewUser from '@/common/graphql/mutations/userCreate.gql';

import { query, mutate } from '@/common/services/apollo';

export type UserResponse = Extract<
  UsersQuery['users'],
  { __typename?: 'UsersConnection' }
>;

export type UserNodes = Extract<
  UserResponse['nodes'],
  Array<{ __typename?: 'User' }>
>;

export type User = UserNodes[number];

export interface FetchOptions extends UsersQueryVariables {
  cache?: boolean;
}

/**
 * Get a list of users.
 *
 * @param options
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function getUsers(options: FetchOptions): Promise<UsersQuery> {
  const opts = {
    cache: true,
    ...options,
  };

  return query<UsersQuery>(
    gqlUsers,
    opts,
    opts.cache ? 'cache-first' : 'network-only'
  );
}

/**
 * Update a user.
 *
 * @param input
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function updateUser(
  input: UpdateUserMutationVariables
): Promise<UpdateUserMutation> {
  return mutate<UpdateUserMutation>(gqlUpdateUser, input);
}

/**
 * Create a new user.
 *
 * @param input
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function newUser(
  input: NewUserMutationVariables
): Promise<NewUserMutation> {
  return mutate<NewUserMutation>(gqlNewUser, input);
}
