import { FETCH_OPTIONS } from '@/constants';
import gqlStudentsByName from '@/graphql/queries/studentsByName.gql';
import gqlStudentsByEmail from '@/graphql/queries/studentsByEmail.gql';
import gqlStudentsByAccountNumber from '@/graphql/queries/studentsByAccountNumber.gql';
import gqlStudentById from '@/graphql/queries/studentById.gql';
import gqlStudents from '@/graphql/queries/students.gql';
import gqlUpdateStudent from '@/graphql/mutations/studentUpdate.gql';
import gqlRegisterStudent from '@/graphql/mutations/studentRegistration.gql';
import gqlNewStudent from '@/graphql/mutations/studentCreate.gql';
import gqlDeleteStudent from '@/graphql/mutations/studentDelete.gql';
import gqlBulkGroup from '@/graphql/mutations/studentBulkUpdate.gql';
import gqlStudentFilter from '@/graphql/queries/studentFilter.gql';
import { query, mutate, mutateCustom } from './Apollo';

interface FetchOptionsBase {
  cache?: boolean;
  first?: number;
  after?: string;
}

interface GroupIdFilter {
  groupId: number;
}

interface StudentFilter {
  OR: GroupIdFilter[];
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

/**
 * Fetch a student by ID.
 *
 * @param options
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function getStudentById(options: GetByIdOptions) {
  const opts = {
    cache: true,
    ...options,
  };

  return query<StudentResponse>(gqlStudentById, opts, opts.cache ? 'cache-first' : 'network-only');
}

/**
 * Fetch one or more students by account number.
 *
 * @param options
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function getStudentsByAccountNumber(options: GetByAccountNumberOptions) {
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

  return query<PagedStudentResponse>(gqlStudentsByAccountNumber, opts, opts.cache ? 'cache-first' : 'network-only');
}

/**
 * Fetch one or more students by email address.
 *
 * @param options
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function getStudentsByEmail(options: GetByEmailOptions) {
  const opts = {
    cache: true,
    first: FETCH_OPTIONS.DEFAULT_COUNT,
    ...options,
  };

  return query<PagedStudentResponse>(gqlStudentsByEmail, opts, opts.cache ? 'cache-first' : 'network-only');
}

/**
 * Fetch one ore more students by first or last name.
 *
 * @param options
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function getStudentsByName(options: GetByNameOptions) {
  const opts = {
    cache: true,
    first: FETCH_OPTIONS.DEFAULT_COUNT,
    ...options,
  };

  return query<PagedStudentResponse>(gqlStudentsByName, opts, opts.cache ? 'cache-first' : 'network-only');
}

/**
 * Fetch one or more students by group.
 *
 * @param options
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function getStudentsByGroup(options: GetByGroupOptions) {
  const opts = {
    cache: true,
    first: FETCH_OPTIONS.DEFAULT_COUNT,
    ...options,
  };

  return query<PagedStudentResponse>(gqlStudents, opts, opts.cache ? 'cache-first' : 'network-only');
}

/**
 * Fetch a list of account numbers for students in the specified groups.
 *
 * @param groupIds A list of group IDs to return student account numbers for.
 * @returns A list of student account numbers for the specified groups.
 */
export async function getStudentIdsByGroup(groupIds: number[]) {
  const where: StudentFilter = {
    OR: groupIds.map((x) => ({ groupId: x })),
  };

  return query<StudentFilterResponse>(gqlStudentFilter, { where }, 'network-only');
}

/**
 * Register a student with the provided information.  Requires a valid preregistration
 * token, see services/auth:studentPreregistration.
 *
 * @param input
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function registerStudent(input: StudentRegistrationRequest) {
  return mutate<StudentRegistrationResponse>(gqlRegisterStudent, input);
}

/**
 * Create a new student and return the data from the server.
 *
 * @param input
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function newStudent(input: NewStudentRequest) {
  return mutate<NewStudentResponse>(gqlNewStudent, input);
}

/**
 * Update a student and return the data from the server.
 *
 * @param input
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function updateStudent(input: UpdateStudentRequest) {
  return mutate<UpdateStudentResponse>(gqlUpdateStudent, input);
}

/**
 * Move a list of students to the provided group.
 *
 * @param targetGroup
 * @param students
 * @returns
 * @throws {Error} If an error occurred during the network call.
 */
export async function bulkMoveStudents(targetGroup: Group, students: Student[]) {
  return mutateCustom<UpdateBulkStudentResponse>({
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
export async function deleteStudent(student: Student) {
  return mutateCustom<DeleteStudentResponse>({
    mutation: gqlDeleteStudent,
    variables: { id: student.id },
    update(cache) {
      cache.evict({
        id: cache.identify({ ...student }),
      });
    },
  });
}
