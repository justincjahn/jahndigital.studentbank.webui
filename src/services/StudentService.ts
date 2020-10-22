import PagedStudentResponse from '@/@types/graphql/PagedStudentResponse';
import StudentStore from '@/store/modules/student';
import ApolloServiceAbstract from './ApolloServiceAbstract';
import query from '../graphql/studentsWithShares.query.gql';

/**
 * Service to perform CRUD operations on students.
 */
export default class StudentService extends ApolloServiceAbstract {
  async getStudents(groupId: number, first = 25, after: string|null = null) {
    StudentStore.setStudentsLoading(true);

    try {
      const res = await this.client.query<PagedStudentResponse>({
        query,
        variables: {
          groupId,
          first,
          after,
        },
      });

      if (res.data) {
        StudentStore.setStudents(
          res.data.students.nodes,
          res.data.students.pageInfo,
          res.data.students.totalCount,
        );
      }
    } catch (e) {
      throw e.message;
    } finally {
      StudentStore.setStudentsLoading(false);
    }
  }
}
