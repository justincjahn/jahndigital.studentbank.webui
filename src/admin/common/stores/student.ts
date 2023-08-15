import type { StudentSortInput } from '@/generated/graphql';
import type { Group } from '@/admin/common/services/group';
import type { Student } from '@/common/services/student';

import { computed, reactive } from 'vue';

import {
  getStudentsByGroup,
  getStudentById,
  getStudentsByAccountNumber,
  getStudentsByEmail,
  getStudentsByName,
  newStudent,
  updateStudent,
  deleteStudent,
  bulkMoveStudents,
} from '@/common/services/student';

import usePagination from '@/common/composables/usePagination';

// Events
import { subscribe } from '@/common/services/eventBus';
import { newTransaction as newTransactionSymbol } from '@/common/events';

/**
 * Stores information about students and the currently selected student.
 */
export function setup() {
  const store = reactive({
    loading: false,
    students: [] as Student[],
    selected: null as Student | null,
    order: undefined as StudentSortInput | undefined,
  });

  const loading = computed(() => store.loading);

  const students = computed(() => store.students);

  const selected = computed({
    get: () => store.selected,
    set: (value) => {
      store.selected = value;
    },
  });

  const {
    totalCount,
    hasNextPage,
    hasPreviousPage,
    pageSize,
    totalPages,
    clear: clearPagination,
    fetch,
    fetchNext,
    fetchPrevious,
  } = usePagination<Parameters<typeof getStudentsByGroup>[0]>({
    async fetch(options, size) {
      store.order = options.order;

      const opts = {
        first: size,
        ...options,
      };

      store.loading = true;

      try {
        const data = await getStudentsByGroup(opts);

        if (!data.students) {
          throw new Error('No data returned');
        }

        store.students = data.students.nodes ?? [];

        return {
          pageInfo: data.students.pageInfo,
          totalCount: data.students.totalCount,
        };
      } finally {
        store.loading = false;
      }
    },

    async fetchNext(cursor, size) {
      const { groupId } = store.students[0] ?? { groupId: -1 };
      store.loading = true;

      try {
        const data = await getStudentsByGroup({
          groupId,
          first: size,
          after: cursor,
          order: store.order,
        });

        if (!data.students) {
          throw new Error('No data returned');
        }

        store.students = data.students.nodes ?? [];

        return {
          pageInfo: data.students.pageInfo,
          totalCount: data.students.totalCount,
        };
      } finally {
        store.loading = false;
      }
    },

    async fetchPrevious(cursor, size) {
      const { groupId } = store.students[0] ?? { groupId: -1 };
      store.loading = true;

      try {
        const data = await getStudentsByGroup({
          groupId,
          first: size,
          after: cursor,
          order: store.order,
        });

        if (!data.students) {
          throw new Error('No data returned');
        }

        store.students = data.students.nodes ?? [];

        return {
          pageInfo: data.students.pageInfo,
          totalCount: data.students.totalCount,
        };
      } finally {
        store.loading = false;
      }
    },
  });

  /**
   * Clear the list of students and reset pagination.
   */
  function clear() {
    store.students = [];
    clearPagination();
  }

  /**
   * Fetch the latest information for the selected student from the API.
   */
  async function refreshSelected() {
    if (store.selected === null) return;

    const data = await getStudentById({
      id: store.selected.id,
      cache: false,
    });

    [store.selected] = data.students?.nodes ?? [];
  }

  /**
   * Fetch a specific student by ID and return it.
   *
   * @param id The ID number of the student.
   * @returns {Student|null} A Student object, or null if no student was found.
   * @throws {Error} If an error ocurred during the fetch operation.
   */
  async function getById(id: number): Promise<Student | null> {
    const data = await getStudentById({ id, cache: false });

    if (!data.students || !data.students.nodes) return null;

    if (data.students.nodes.length > 0) {
      const [student] = data.students.nodes;
      return student;
    }

    return null;
  }

  /**
   * Mutate the store by selecting a student by their unique ID.
   *
   * @param id The student's unique ID.
   */
  async function selectById(id: number): Promise<Student | null> {
    store.loading = true;

    try {
      selected.value = await getById(id);
      return selected.value;
    } finally {
      store.loading = false;
    }
  }

  /**
   * Fetch one or more students by account number.
   *
   * @param accountNumber The account number to search by.  Does not require leading zeros.
   * @throws {Error} If the account number provided was invalid or a GRAPHQL error occurs.
   */
  async function getByAccountNumber(accountNumber: string): Promise<Student[]> {
    const data = await getStudentsByAccountNumber({
      accountNumber,
    });

    return data.students?.nodes ?? [];
  }

  /**
   * Fetch one or more students by email address.
   *
   * @param email The email address of the student.
   */
  async function getByEmail(email: string): Promise<Student[]> {
    const data = await getStudentsByEmail({ email });
    return data.students?.nodes ?? [];
  }

  /**
   * Fetch one or more students by first or last name.
   *
   * @param name The partial name of the student.
   */
  async function getByName(name: string): Promise<Student[]> {
    const data = await getStudentsByName({ name });
    return data.students?.nodes ?? [];
  }

  /**
   * Create a new student using the provided information.
   *
   * @param input The student to create.
   * @throws {Error} If an issue was encountered while attempting to create the student.
   */
  async function create(input: Parameters<typeof newStudent>[0]) {
    const data = await newStudent(input);
    const [student] = data.newStudent;

    if (store.students[0]?.groupId === input.groupId ?? true) {
      store.students = [...store.students, student];
    }

    return student;
  }

  /**
   * Persist changes to the provided Student object.
   *
   * @param student The student to update.
   * @throws {Error} If an issue was encountered while attempting the API call.
   */
  async function update(student: Student) {
    const data = await updateStudent({
      id: student.id,
      groupId: student.groupId,
      accountNumber: student.accountNumber.padStart(10, '0'),
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
    });

    if (store.selected && store.selected.id === student.id) {
      [store.selected] = data.updateStudent;

      const index = store.students.findIndex((x) => x.id === student.id);
      if (index >= 0) {
        store.students = store.students.splice(index, 1, student);
      }
    }

    return data.updateStudent;
  }

  /**
   * Reset a student's password.
   *
   * @param id
   * @param password
   * @throws {Error} If an issue was encountered while attempting the API call.
   */
  async function updatePassword(id: number, password: string) {
    const data = await updateStudent({
      id,
      password,
    });

    return data.updateStudent;
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
      await bulkMoveStudents(g, s);
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
  async function remove(student: Student) {
    const data = await deleteStudent(student);

    if (data.deleteStudent === true) {
      const isListed = store.students.findIndex((x) => x.id === student.id);
      if (isListed >= 0) {
        store.students = store.students.filter((x) => x.id !== student.id);
      }
    } else {
      throw new Error('Unable to delete student: unknown reason.');
    }
  }

  /**
   * When a new transaction posts to a share owned by the selected student,
   * proactively refresh the store.
   */
  const onNewTransaction = subscribe(
    newTransactionSymbol,

    async (transaction) => {
      if (store.selected === null) return;

      const targetShare = store.selected.shares.find(
        (share) => share.id === transaction.targetShareId
      );

      if (!targetShare) return;

      await refreshSelected();
    }
  );

  /**
   * Dispose of any events we're subscribed to
   */
  function dispose() {
    onNewTransaction();
  }

  return {
    // State
    loading,
    students,
    selected,
    selectById,
    refreshSelected,
    clear,
    dispose,

    // Pagination
    totalCount,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    fetch,
    fetchNext,
    fetchPrevious,

    // CRUD
    getById,
    getByAccountNumber,
    getByEmail,
    getByName,
    create,
    update,
    updatePassword,
    bulkMove,
    remove,
  };
}

const store = setup();
export type StudentStore = ReturnType<typeof setup>;
export default store;
