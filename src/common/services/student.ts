import type {
  StudentsByNameQuery,
  StudentsByNameQueryVariables,
  StudentsByEmailQuery,
  StudentsByEmailQueryVariables,
  StudentsByAccountNumberQuery,
  StudentsByAccountNumberQueryVariables,
  StudentsByIdQuery,
  StudentsByIdQueryVariables,
  StudentsWithSharesQuery,
  StudentsWithSharesQueryVariables,
  StudentsFilterQuery,
  StudentsFilterQueryVariables,
  UpdateStudentMutation,
  UpdateStudentMutationVariables,
  StudentRegistrationMutation,
  StudentRegistrationMutationVariables,
  NewStudentMutation,
  NewStudentMutationVariables,
  DeleteStudentMutation,
  UpdateBulkStudentMutation,
} from '@/generated/graphql';

import type { Group } from '@/admin/common/services/group';

import { FETCH_OPTIONS } from '@/common/constants';
import { query, mutate, mutateCustom } from '@/common/services/apollo';

import gqlStudentsByName from '@/common/graphql/queries/studentsByName.gql';
import gqlStudentsByEmail from '@/common/graphql/queries/studentsByEmail.gql';
import gqlStudentsByAccountNumber from '@/common/graphql/queries/studentsByAccountNumber.gql';
import gqlStudentById from '@/common/graphql/queries/studentById.gql';
import gqlUpdateStudent from '@/common/graphql/mutations/studentUpdate.gql';
import gqlNewStudent from '@/common/graphql/mutations/studentCreate.gql';
import gqlDeleteStudent from '@/common/graphql/mutations/studentDelete.gql';
import gqlBulkGroup from '@/common/graphql/mutations/studentBulkUpdate.gql';
import gqlStudentFilter from '@/common/graphql/queries/studentFilter.gql';
import gqlStudentsWithShares from '@/common/graphql/queries/studentsWithShares.gql';
import gqlRegisterStudent from '@/common/graphql/mutations/studentRegistration.gql';

interface FetchOptionsBase {
  cache?: boolean;
  first?: number;
  after?: string;
}

export interface GetByIdOptions extends FetchOptionsBase {
  id: number;
}

export interface GetByAccountNumberOptions extends FetchOptionsBase {
  accountNumber: string;
}

export interface GetByEmailOptions extends FetchOptionsBase {
  email: string;
}

export interface GetByNameOptions extends FetchOptionsBase {
  name: string;
}

export interface GetByGroupOptions extends FetchOptionsBase {
  groupId: number;
}

export type StudentResponse = Extract<
  StudentsByAccountNumberQuery['students'],
  { __typename?: 'StudentsConnection' | undefined }
>;

export type StudentNodes = Extract<
  StudentResponse['nodes'],
  Array<{ __typename?: 'Student' }>
>;

export type Student = StudentNodes[number];

/**
 * Fetch a student by ID.
 *
 * @param options
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function getStudentById(
  options: GetByIdOptions
): Promise<StudentsByIdQuery> {
  const opts = {
    cache: true,
    ...options,
  };

  return query<StudentsByIdQuery, StudentsByIdQueryVariables>(
    gqlStudentById,
    opts,
    opts.cache ? 'cache-first' : 'network-only'
  );
}

/**
 * Fetch one or more students by account number.
 *
 * @param options
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function getStudentsByAccountNumber(
  options: GetByAccountNumberOptions
): Promise<StudentsByAccountNumberQuery> {
  const opts = {
    cache: true,
    first: FETCH_OPTIONS.DEFAULT_COUNT,
    ...options,
  };

  if (opts.accountNumber.length > 10) {
    throw new Error('Account numbers cannot be more than 10 characters.');
  }

  if (!/^[0-9]+$/.test(opts.accountNumber)) {
    throw new Error('Account numbers can only contain numbers.');
  }

  return query<
    StudentsByAccountNumberQuery,
    StudentsByAccountNumberQueryVariables
  >(
    gqlStudentsByAccountNumber,
    opts,
    opts.cache ? 'cache-first' : 'network-only'
  );
}

/**
 * Fetch one or more students by email address.
 *
 * @param options
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function getStudentsByEmail(
  options: GetByEmailOptions
): Promise<StudentsByEmailQuery> {
  const opts = {
    cache: true,
    first: FETCH_OPTIONS.DEFAULT_COUNT,
    ...options,
  };

  return query<StudentsByEmailQuery, StudentsByEmailQueryVariables>(
    gqlStudentsByEmail,
    opts,
    opts.cache ? 'cache-first' : 'network-only'
  );
}

/**
 * Fetch one ore more students by first or last name.
 *
 * @param options
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function getStudentsByName(
  options: GetByNameOptions
): Promise<StudentsByNameQuery> {
  const opts = {
    cache: true,
    first: FETCH_OPTIONS.DEFAULT_COUNT,
    ...options,
  };

  return query<StudentsByNameQuery, StudentsByNameQueryVariables>(
    gqlStudentsByName,
    opts,
    opts.cache ? 'cache-first' : 'network-only'
  );
}

/**
 * Fetch one or more students by group.
 *
 * @param options
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function getStudentsByGroup(
  options: GetByGroupOptions
): Promise<StudentsWithSharesQuery> {
  const opts = {
    cache: true,
    first: FETCH_OPTIONS.DEFAULT_COUNT,
    ...options,
  };

  return query<StudentsWithSharesQuery, StudentsWithSharesQueryVariables>(
    gqlStudentsWithShares,
    opts,
    opts.cache ? 'cache-first' : 'network-only'
  );
}

/**
 * Fetch a list of account numbers for students in the specified groups.
 *
 * @param groupIds A list of group IDs to return student account numbers for.
 * @returns A list of student account numbers for the specified groups.
 */
export async function getStudentIdsByGroup(
  groupIds: number[],
  options: FetchOptionsBase = {}
): Promise<StudentsFilterQuery> {
  const opts: StudentsFilterQueryVariables = {
    ...options,
    where: {
      groupId: {
        in: groupIds.map((x) => x),
      },
    },
  };

  return query<StudentsWithSharesQuery>(gqlStudentFilter, opts, 'network-only');
}

/**
 * Register a student with the provided information.  Requires a valid preregistration
 * token, see services/auth:studentPreregistration.
 *
 * @param input
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function registerStudent(
  input: StudentRegistrationMutationVariables
): Promise<StudentRegistrationMutation> {
  return mutate<StudentRegistrationMutation>(gqlRegisterStudent, input);
}

/**
 * Create a new student and return the data from the server.
 *
 * @param input
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function newStudent(
  input: NewStudentMutationVariables
): Promise<NewStudentMutation> {
  return mutate<NewStudentMutation>(gqlNewStudent, input);
}

/**
 * Update a student and return the data from the server.
 *
 * @param input
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function updateStudent(
  input: UpdateStudentMutationVariables
): Promise<UpdateStudentMutation> {
  return mutate<UpdateStudentMutation>(gqlUpdateStudent, input);
}

/**
 * Move a list of students to the provided group.
 *
 * @param targetGroup
 * @param students
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function bulkMoveStudents(
  targetGroup: Group,
  students: Student[]
): Promise<UpdateBulkStudentMutation> {
  return mutateCustom<UpdateBulkStudentMutation>({
    mutation: gqlBulkGroup,
    variables: {
      students: students.map((x) => ({ id: x.id, groupId: targetGroup.id })),
    },
    update(cache) {
      cache.evict({
        id: 'ROOT_QUERY',
        fieldName: 'students',
      });

      cache.gc();
    },
  });
}

/**
 * Delete a student.
 *
 * @param student
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function deleteStudent(
  student: Student
): Promise<DeleteStudentMutation> {
  return mutateCustom<DeleteStudentMutation>({
    mutation: gqlDeleteStudent,
    variables: { id: student.id },
    update(cache) {
      cache.evict({
        id: cache.identify({ ...student }),
      });
    },
  });
}
