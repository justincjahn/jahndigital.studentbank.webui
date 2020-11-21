import PageInfo from '@/@types/PageInfo';
import Student from '@/@types/Student';

export default interface IStudentState {
  students: Student[];

  selectedStudent: Student|null;

  totalCount: number;

  pageInfo: PageInfo|null;

  loading: boolean;

  studentPageCount: number;
}
