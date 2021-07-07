/* eslint-disable import/prefer-default-export */
import { mutate } from './Apollo';
import gqlUpdateUser from '../graphql/mutations/userUpdate.gql';

/**
 * Update a student and return the data from the server.
 *
 * @param input
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function updateUser(input: UpdateUserRequest) {
  return mutate<UpdateUserResponse>(gqlUpdateUser, input);
}
