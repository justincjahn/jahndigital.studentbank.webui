import { FETCH_OPTIONS } from '@/constants';
import { computed, reactive } from 'vue';
import Apollo from '@/services/Apollo';
import gqlStudentsByName from '@/modules/admin/graphql/queries/studentsByName.gql';
import gqlStudentsByEmail from '@/modules/admin/graphql/queries/studentsByEmail.gql';
import gqlStudentsByAccountNumber from '@/modules/admin/graphql/queries/studentsByAccountNumber.gql';
import gqlStudentById from '../graphql/queries/studentById.gql';
import gqlStudents from '../graphql/queries/students.gql';
import gqlUpdateStudent from '../graphql/mutations/studentUpdate.gql';
import gqlNewStudent from '../graphql/mutations/studentCreate.gql';
import gqlDeleteStudent from '../graphql/mutations/studentDelete.gql';
import gqlBulkGroup from '../graphql/mutations/studentBulkUpdate.gql';

/**
 * Options used during the initial fetch.
 */
type FetchOptions = {
  // The Group ID to filter the list by
  groupId: number;

  // The number of students to skip for the initial fetch
  first?: number;

  // If the cache should be hit for the fetch operations
  cache?: boolean;
}

/**
 * Stores information about students and the currently selected student.
 */
export function setup() {
  const store = reactive({
    loading: false,
    totalCount: 0,
    pageInfo: null as PageInfo|null,
    pageCount: FETCH_OPTIONS.DEFAULT_COUNT,
    cursorStack: [] as string[],
    students: [] as Student[],
    selected: null as Student|null,
  });

  // GETs the loading state of the fetch operation
  const loading = computed(() => store.loading);

  // GETs the totalCount number of students
  const totalCount = computed(() => store.totalCount);

  // GETs the PageInfo
  const pageInfo = computed(() => store.pageInfo);

  // Gets the list of currently fetched students
  const students = computed(() => store.students);

  // GETs the selected student
  const selected = computed(() => store.selected);

  // GETs the current number of items to fetch per operation
  const currentFetchCount = computed(
    () => store.pageCount ?? FETCH_OPTIONS.DEFAULT_COUNT,
  );

  // GETs the totalCount number of pages
  const totalPages = computed(() => {
    if (store.totalCount > 0) {
      return Math.ceil(store.totalCount / currentFetchCount.value);
    }

    return 0;
  });

  /**
   * Set or clear the currently selected student.
   *
   * @param {Student|null} item The new value.
   */
  function setSelected(item: Student|null) { store.selected = item; }

  /**
   * Fetch the latest information for the selected student from the API.
   */
  async function refreshSelected() {
    if (store.selected === null) return;

    try {
      const res = await Apollo.query<StudentResponse>({
        query: gqlStudentById,
        fetchPolicy: 'network-only',
        variables: {
          id: store.selected.id,
        },
      });

      if (res.data) {
        [store.selected] = res.data.students.nodes;
      }
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  /**
   * Fetch an initial list of students using the provided options.
   *
   * @param {FetchOptions} options
   */
  async function fetch(options: FetchOptions) {
    const pageCount = options.first ?? currentFetchCount.value;
    store.loading = true;

    try {
      const res = await Apollo.query<PagedStudentResponse>({
        query: gqlStudents,
        fetchPolicy: (options.cache === false) ? 'network-only' : 'cache-first',
        variables: {
          groupId: options.groupId,
          first: pageCount,
        },
      });

      if (res.data) {
        store.students = res.data.students.nodes;
        store.pageInfo = res.data.students.pageInfo;
        store.totalCount = res.data.students.totalCount;
        store.pageCount = pageCount;
        store.cursorStack = [];
      }
    } catch (e) {
      throw e?.message ?? e;
    } finally {
      store.loading = false;
    }
  }

  /**
   * Fetch the next page of students.
   */
  async function fetchNext() {
    const { groupId } = store.students[0] ?? { groupId: -1 };
    store.loading = true;

    try {
      const res = await Apollo.query<PagedStudentResponse>({
        query: gqlStudents,
        variables: {
          groupId,
          first: currentFetchCount.value,
          after: store.pageInfo?.endCursor ?? null,
        },
      });

      if (res.data) {
        // Add the current end cursor to the stack before we overwrite it
        store.cursorStack = [...store.cursorStack, store.pageInfo?.endCursor ?? ''];
        store.students = res.data.students.nodes;
        store.pageInfo = res.data.students.pageInfo;
        store.totalCount = res.data.students.totalCount;
      }
    } catch (e) {
      throw e?.message ?? e;
    } finally {
      store.loading = false;
    }
  }

  /**
   * Fetch the previous page of students.
   */
  async function fetchPrevious() {
    const { groupId } = store.students[0] ?? { groupId: -1 };
    store.loading = true;

    try {
      const stack = [...store.cursorStack];
      stack.pop();

      const res = await Apollo.query<PagedStudentResponse>({
        query: gqlStudents,
        variables: {
          groupId,
          first: currentFetchCount.value,
          after: stack[stack.length - 1] ?? null,
        },
      });

      if (res.data) {
        store.students = res.data.students.nodes;
        store.pageInfo = res.data.students.pageInfo;
        store.totalCount = res.data.students.totalCount;
        store.cursorStack = stack;
      }
    } catch (e) {
      throw e?.message ?? e;
    } finally {
      store.loading = false;
    }
  }

  /**
   * Clear the list of students.
   */
  async function clear() {
    store.students = [];
    store.pageInfo = null;
    store.totalCount = 0;
  }

  /**
   * Create a new student using the provided information.
   *
   * @param input The student to create.
   * @throws {Error} If an issue was encountered while attempting to create the student.
   */
  async function newStudent(input: NewStudentRequest) {
    try {
      const res = await Apollo.mutate<NewStudentResponse>({
        mutation: gqlNewStudent,
        variables: input,
      });

      if (res.data) {
        const [student] = res.data.newStudent;

        if (store.students[0]?.groupId === input.groupId ?? true) {
          store.students = [...store.students, student];
        }

        return student;
      }

      throw new Error('Unable to create Student: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  /**
   * Fetch a specific student by ID and return it.
   *
   * @param id The ID number of the student.
   * @returns {Student|null} A Student object, or null if no student was found.
   * @throws {Error} If an error ocurred during the fetch operation.
   */
  async function getById(id: number): Promise<Student | null> {
    const res = await Apollo.query<PagedStudentResponse>({
      query: gqlStudentById,
      variables: {
        id,
      },
    });

    if (res.data && res.data.students.nodes.length > 0) {
      const [student] = res.data.students.nodes;
      return student;
    }

    return null;
  }

  /**
   * Fetch one or more students by account number.
   *
   * @param accountNumber The account number to search by.  Does not require leading zeros.
   * @throws {Error} If the account number provided was invalid or a GRAPHQL error occurs.
   */
  async function getByAccountNumber(accountNumber: string): Promise<Student[]> {
    if (accountNumber.length > 10) {
      throw new Error('Account numbers cannot be more than 10 characters.');
    }

    if (!/^[0-9]+$/.test(accountNumber)) {
      throw new Error('Account numbers can only contain numbers.');
    }

    const res = await Apollo.query<PagedStudentResponse>({
      query: gqlStudentsByAccountNumber,
      variables: {
        accountNumber,
      },
    });

    if (res.data && res.data.students) {
      return res.data.students.nodes;
    }

    return [];
  }

  /**
   * Fetch one or more students by email address.
   *
   * @param email The email address of the student.
   */
  async function getByEmail(email: string): Promise<Student[]> {
    const res = await Apollo.query<PagedStudentResponse>({
      query: gqlStudentsByEmail,
      variables: {
        email,
      },
    });

    if (res.data && res.data.students) {
      return res.data.students.nodes;
    }

    return [];
  }

  /**
   * Fetch one or more students by first or last name.
   *
   * @param name The partial name of the student.
   */
  async function getByName(name: string): Promise<Student[]> {
    const res = await Apollo.query<PagedStudentResponse>({
      query: gqlStudentsByName,
      variables: {
        name,
      },
    });

    if (res.data && res.data.students) {
      return res.data.students.nodes;
    }

    return [];
  }

  /**
   * Persist changes to the provided Student object.
   *
   * @param student The student to update.
   * @throws {Error} If an issue was encountered while attempting the API call.
   */
  async function updateStudent(student: Student) {
    try {
      const res = await Apollo.mutate<UpdateStudentResponse>({
        mutation: gqlUpdateStudent,
        variables: {
          id: student.id,
          groupId: student.groupId,
          accountNumber: student.accountNumber.padStart(10, '0'),
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
        },
      });

      if (res.data) {
        if (store.selected && store.selected.id === student.id) {
          [store.selected] = res.data.updateStudent;

          const index = store.students.findIndex((x) => x.id === student.id);
          if (index >= 0) {
            store.students = store.students.splice(index, 1, student);
          }
        }

        return res.data.updateStudent;
      }

      throw new Error('Unable to update Student: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  /**
   * Move the provided students to a new group.
   *
   * @param {Group} g The group to move the students to.
   * @param {Student[]} s The students to move.
   */
  async function bulkMove(g: Group, s: Student[]) {
    store.loading = true;

    try {
      const res = await Apollo.mutate<UpdateBulkStudentResponse>({
        mutation: gqlBulkGroup,
        variables: {
          students: s.map((x) => ({ id: x.id, groupId: g.id })),
        },
        update(cache) {
          cache.evict({
            id: 'ROOT_QUERY',
            fieldName: 'students',
            broadcast: false,
          });

          cache.gc();
        },
      });

      if (!res.data) throw new Error('Unable post transaction: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    } finally {
      store.loading = false;
    }
  }

  /**
   * Delete the provided student from the database.
   *
   * @param student The student to delete.
   * @throws {Error} If an issue was encountered while attempting to delete the student.
   */
  async function deleteStudent(student: Student) {
    try {
      const res = await Apollo.mutate<DeleteStudentResponse>({
        mutation: gqlDeleteStudent,
        variables: { id: student.id },
        update(cache) {
          cache.evict({
            id: cache.identify({ ...student }),
          });
        },
      });

      if (res.data && res.data.deleteStudent === true) {
        const isListed = store.students.findIndex((x) => x.id === student.id);
        if (isListed >= 0) {
          store.students = store.students.filter((x) => x.id !== student.id);
        }
      } else {
        throw new Error('Unable to delete student: unknown reason.');
      }
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  return {
    loading,
    totalCount,
    pageInfo,
    students,
    selected,
    totalPages,
    setSelected,
    refreshSelected,
    fetch,
    fetchNext,
    fetchPrevious,
    clear,
    newStudent,
    getById,
    getByAccountNumber,
    getByEmail,
    getByName,
    updateStudent,
    bulkMove,
    deleteStudent,
  };
}

const store = setup();
export type StudentStore = ReturnType<typeof setup>;
export default store;
