/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable class-methods-use-this */
import PageInfo from '@/@types/PageInfo';
import PagedStudentResponse from '@/@types/graphql/PagedStudentResponse';
import { getModule, Module, Mutation, MutationAction, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import Student from '@/@types/Student';
import Apollo from '@/services/Apollo';
import StudentsWithShares from '@/graphql/studentsWithShares.query.gql';
import UpdateStudent from '@/graphql/updateStudent.mutation.gql';
import { FETCH_OPTIONS } from '@/constants';
import UpdateStudentResponse from '@/@types/graphql/UpdateStudentResponse';
import IStudentState from './IStudentState';

type FetchOptions = {
  groupId: number;
  first?: number;
}

@Module({ dynamic: true, store, name: 'student' })
class StudentState extends VuexModule implements IStudentState {
  totalCount = 0;

  pageInfo: PageInfo|null = null;

  students: Student[] = [];

  selectedStudent: Student|null = null;

  studentPageCount = FETCH_OPTIONS.DEFAULT_COUNT;

  studentCursorStack: string[] = [];

  studentCurrentPage = 0;

  loading = false;

  /**
   * Fetch students from the GraphQL API.
   *
   * @param fetchOptions Options for the fetch.
   */
  @MutationAction
  async fetchStudents(options: FetchOptions) {
    const self = this as Record<string, any>;
    self.commit('setStudentsLoading', true);

    const pageCount = options.first ?? self.getters.currentStudentFetchCount;
    try {
      const res = await Apollo.query<PagedStudentResponse>({
        query: StudentsWithShares,
        variables: {
          groupId: options.groupId,
          first: pageCount,
        },
      });

      if (res.data) {
        return {
          students: res.data.students.nodes,
          pageInfo: res.data.students.pageInfo,
          totalCount: res.data.students.totalCount,
          studentPageCount: pageCount,
          studentCursorStack: [] as string[],
        };
      }
    } catch (e) {
      throw e?.message ?? e;
    } finally {
      self.commit('setStudentsLoading', false);
    }

    return {
      students: [],
      pageInfo: null,
      totalCount: 0,
      studentPageCount: pageCount,
      studentCursorStack: [] as string[],
    };
  }

  /**
   * Update a student on the GraphQL API and the local store.
   *
   * @param student The student to update.
   */
  @Mutation
  async updateStudent(student: Student) {
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
        if (this.selectedStudent && this.selectedStudent.id === student.id) {
          [this.selectedStudent] = res.data.updateStudent;

          const index = this.students.findIndex((x) => x.id === student.id);
          if (index >= 0) {
            const students = this.students.splice(index, 1, student);
            this.students = students;
          }
        }

        await Apollo.clearStore();
      }
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  /**
   * Fetch the next page of students from the GraphQL API.
   */
  @MutationAction
  async fetchNext() {
    const self = this as Record<string, any>;
    self.commit('setStudentsLoading', true);

    const { groupId } = self.state.students[0] ?? { groupId: -1 };

    try {
      const res = await Apollo.query<PagedStudentResponse>({
        query: StudentsWithShares,
        variables: {
          groupId,
          first: self.getters.currentStudentFetchCount,
          after: self.state.pageInfo.endCursor,
        },
      });

      if (res.data) {
        // Add the current end cursor to the stack before we overwrite it
        const studentCursorStack = [
          ...self.state.studentCursorStack,
          self.state.pageInfo.endCursor,
        ];

        return {
          students: res.data.students.nodes,
          pageInfo: res.data.students.pageInfo,
          totalCount: res.data.students.totalCount,
          studentCursorStack,
        };
      }
    } catch (e) {
      throw e?.message ?? e;
    } finally {
      self.commit('setStudentsLoading', false);
    }

    return {};
  }

  /**
   * Fetch the previous page of students from the GraphQL API.
   */
  @MutationAction
  async fetchPrevious() {
    const self = this as Record<string, any>;
    self.commit('setStudentsLoading', true);

    const { groupId } = self.state.students[0] ?? { groupId: -1 };

    try {
      const stack = [...self.state.studentCursorStack];
      stack.pop();

      const res = await Apollo.query<PagedStudentResponse>({
        query: StudentsWithShares,
        variables: {
          groupId,
          first: self.getters.currentStudentFetchCount,
          after: stack[stack.length - 1] ?? null,
        },
      });

      if (res.data) {
        return {
          students: res.data.students.nodes,
          pageInfo: res.data.students.pageInfo,
          totalCount: res.data.students.totalCount,
          studentCursorStack: stack,
        };
      }
    } catch (e) {
      throw e?.message ?? e;
    } finally {
      self.commit('setStudentsLoading', false);
    }

    return {};
  }

  /**
   * Clear the list of students.
   */
  @MutationAction({ mutate: ['students', 'pageInfo', 'totalCount'] })
  async clearStudents() {
    return {
      students: [],
      pageInfo: null,
      totalCount: 0,
    };
  }

  /**
   * Set the provided student as selected.
   *
   * @param student The student to select.
   */
  @Mutation
  setSelectedStudent(student: Student|null) {
    this.selectedStudent = student;
  }

  /**
   * Set the state to loading.
   *
   * @param loading The loading state.
   */
  @Mutation
  setStudentsLoading(loading: boolean) {
    this.loading = loading;
  }

  /**
   * Get the total number of pages.
   */
  get totalStudentPages() {
    if (this.totalCount > 0) {
      return Math.ceil(this.totalCount / this.currentStudentFetchCount);
    }

    return 0;
  }

  /**
   * Get the current number of students to fetch.
   */
  get currentStudentFetchCount() {
    return this.studentPageCount ?? FETCH_OPTIONS.DEFAULT_COUNT;
  }
}

const StudentModule = getModule(StudentState);
export default StudentModule;
