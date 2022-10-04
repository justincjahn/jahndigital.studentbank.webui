import { computed, reactive } from 'vue';

import type { Group } from '@/admin/common/services/group';
import type { Student } from '@/common/services/student';

import {
  getStudentsByGroup,
  getStudentById,
  getStudentsByAccountNumber,
  getStudentsByEmail,
  getStudentsByName,
  newStudent as ssNewStudent,
  updateStudent as ssUpdateStudent,
  deleteStudent as ssDeleteStudent,
  bulkMoveStudents,
} from '@/common/services/student';

import usePagination from '@/common/composables/usePagination';

/**
 * Stores information about students and the currently selected student.
 */
export function setup() {
  const store = reactive({
    loading: false,
    students: [] as Student[],
    selected: null as Student | null,
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
   * Create a new student using the provided information.
   *
   * @param input The student to create.
   * @throws {Error} If an issue was encountered while attempting to create the student.
   */
  async function newStudent(input: Parameters<typeof ssNewStudent>[0]) {
    const data = await ssNewStudent(input);
    const [student] = data.newStudent;

    if (store.students[0]?.groupId === input.groupId ?? true) {
      store.students = [...store.students, student];
    }

    return student;
  }

  /**
   * Fetch a specific student by ID and return it.
   *
   * @param id The ID number of the student.
   * @returns {Student|null} A Student object, or null if no student was found.
   * @throws {Error} If an error ocurred during the fetch operation.
   */
  async function getById(id: number): Promise<Student | null> {
    const data = await getStudentById({ id });

    if (!data.students || !data.students.nodes) return null;

    if (data.students.nodes.length > 0) {
      const [student] = data.students.nodes;
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
   * Persist changes to the provided Student object.
   *
   * @param student The student to update.
   * @throws {Error} If an issue was encountered while attempting the API call.
   */
  async function updateStudent(student: Student) {
    const data = await ssUpdateStudent({
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
    const data = await ssUpdateStudent({
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
  async function deleteStudent(student: Student) {
    const data = await ssDeleteStudent(student);

    if (data.deleteStudent === true) {
      const isListed = store.students.findIndex((x) => x.id === student.id);
      if (isListed >= 0) {
        store.students = store.students.filter((x) => x.id !== student.id);
      }
    } else {
      throw new Error('Unable to delete student: unknown reason.');
    }
  }

  return {
    // State
    loading,
    students,
    selected,
    refreshSelected,
    clear,

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
    newStudent,
    getById,
    getByAccountNumber,
    getByEmail,
    getByName,
    updateStudent,
    updatePassword,
    bulkMove,
    deleteStudent,
  };
}

const store = setup();
export type StudentStore = ReturnType<typeof setup>;
export default store;
