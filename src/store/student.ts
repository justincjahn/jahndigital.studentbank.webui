import Apollo from '@/services/Apollo';
import StudentsWithShares from '@/graphql/studentsWithShares.query.gql';
import UpdateStudent from '@/graphql/updateStudent.mutation.gql';
import gqlStudentById from '@/graphql/studentById.gql';
import gqlNewStudent from '@/graphql/newStudent.mutation.gql';
import gqlDeleteStudent from '@/graphql/deleteStudent.mutation.gql';
import { FETCH_OPTIONS } from '@/constants';
import { computed, reactive } from 'vue';

type FetchOptions = {
  groupId: number;
  first?: number;
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

  // SETs the selected student
  function setSelected(item: Student|null) { store.selected = item; }

  // Refresh the currently selected student
  async function refreshSelected() {
    if (store.selected === null) return;

    try {
      const res = await Apollo.query<StudentResponse>({
        query: gqlStudentById,
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

  // Fetch the initial list of students
  async function fetch(options: FetchOptions) {
    const pageCount = options.first ?? currentFetchCount.value;
    store.loading = true;

    try {
      const res = await Apollo.query<PagedStudentResponse>({
        query: StudentsWithShares,
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

  // Fetch the next page of students
  async function fetchNext() {
    const { groupId } = store.students[0] ?? { groupId: -1 };
    store.loading = true;

    try {
      const res = await Apollo.query<PagedStudentResponse>({
        query: StudentsWithShares,
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

  // Fetch the previous page of students
  async function fetchPrevious() {
    const { groupId } = store.students[0] ?? { groupId: -1 };
    store.loading = true;

    try {
      const stack = [...store.cursorStack];
      stack.pop();

      const res = await Apollo.query<PagedStudentResponse>({
        query: StudentsWithShares,
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

  // Clear the list of students
  async function clear() {
    store.students = [];
    store.pageInfo = null;
    store.totalCount = 0;
  }

  // Update a student
  async function updateStudent(student: Student) {
    try {
      const res = await Apollo.mutate<UpdateStudentResponse>({
        mutation: UpdateStudent,
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

        await Apollo.clearStore();
        return res.data.updateStudent;
      }

      throw new Error('Unable to update Student: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  // Create a new student
  async function newStudent(input: NewStudentRequest) {
    try {
      const res = await Apollo.mutate<NewStudentResponse>({
        mutation: gqlNewStudent,
        variables: input,
      });

      if (res.data) {
        const [student] = res.data.newStudent;

        if (store.students[0]?.groupId === input.groupId ?? false) {
          store.students = [...store.students, student];
        }

        return student;
      }

      throw new Error('Unable to create Student: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  // Delete a student
  async function deleteStudent(student: Student) {
    try {
      const res = await Apollo.mutate<DeleteStudentResponse>({
        mutation: gqlDeleteStudent,
        variables: { id: student.id },
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
    updateStudent,
    deleteStudent,
  };
}

const store = setup();
export type StudentStore = ReturnType<typeof setup>;
export default store;
