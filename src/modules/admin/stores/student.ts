import { FETCH_OPTIONS } from '@/constants';
import { computed, reactive } from 'vue';
import * as studentService from '@/services/student';

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

  const hasNextPage = computed(() => store.pageInfo?.hasNextPage ?? false);

  const hasPreviousPage = computed(() => store.pageInfo?.hasPreviousPage ?? false);

  // Gets the list of currently fetched students
  const students = computed(() => store.students);

  // GETs the selected student
  const selected = computed({
    get: () => store.selected,
    set: (value) => {
      store.selected = value;
    },
  });

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
    const data = await studentService.getStudentById({ id: store.selected.id, cache: false });
    [store.selected] = data.students.nodes;
  }

  /**
   * Fetch an initial list of students using the provided options.
   *
   * @param {FetchOptions} options
   */
  async function fetch(options: studentService.GetByGroupOptions) {
    const opts = {
      first: FETCH_OPTIONS.DEFAULT_COUNT,
      ...options,
    };

    store.loading = true;

    try {
      const data = await studentService.getStudentsByGroup(opts);
      store.students = data.students.nodes;
      store.pageInfo = data.students.pageInfo;
      store.totalCount = data.students.totalCount;
      store.pageCount = opts.first;
      store.cursorStack = [];
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
      const data = await studentService.getStudentsByGroup({
        groupId,
        first: store.pageCount,
        after: store.pageInfo?.endCursor ?? undefined,
      });

      store.cursorStack = [...store.cursorStack, store.pageInfo?.endCursor ?? ''];
      store.students = data.students.nodes;
      store.pageInfo = data.students.pageInfo;
      store.totalCount = data.students.totalCount;
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

      const data = await studentService.getStudentsByGroup({
        groupId,
        first: store.pageCount,
        after: stack[stack.length - 1] ?? undefined,
      });

      store.students = data.students.nodes;
      store.pageInfo = data.students.pageInfo;
      store.totalCount = data.students.totalCount;
      store.cursorStack = stack;
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
    const data = await studentService.newStudent(input);
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
    const data = await studentService.getStudentById({ id });

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
    const data = await studentService.getStudentsByAccountNumber({ accountNumber });
    if (data.students) { return data.students.nodes; }
    return [];
  }

  /**
   * Fetch one or more students by email address.
   *
   * @param email The email address of the student.
   */
  async function getByEmail(email: string): Promise<Student[]> {
    const data = await studentService.getStudentsByEmail({ email });
    if (data.students) { return data.students.nodes; }
    return [];
  }

  /**
   * Fetch one or more students by first or last name.
   *
   * @param name The partial name of the student.
   */
  async function getByName(name: string): Promise<Student[]> {
    const data = await studentService.getStudentsByName({ name });
    if (data.students) { return data.students.nodes; }
    return [];
  }

  /**
   * Persist changes to the provided Student object.
   *
   * @param student The student to update.
   * @throws {Error} If an issue was encountered while attempting the API call.
   */
  async function updateStudent(student: Student) {
    const data = await studentService.updateStudent({
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

  async function updatePassword(id: number, password: string) {
    const data = await studentService.updateStudent({
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
      await studentService.bulkMoveStudents(g, s);
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
    const data = await studentService.deleteStudent(student);

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
    loading,
    totalCount,
    hasNextPage,
    hasPreviousPage,
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
    updatePassword,
    bulkMove,
    deleteStudent,
  };
}

const store = setup();
export type StudentStore = ReturnType<typeof setup>;
export default store;
