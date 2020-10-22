import PageInfo from '@/@types/PageInfo';
import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import Student from '@/@types/Student';
import IStudentState from './IStudentState';

@Module({ dynamic: true, store, name: 'student' })
class StudentState extends VuexModule implements IStudentState {
  totalCount = 0;

  pageInfo: PageInfo|null = null;

  students: Student[] = [];

  selectedStudent?: Student;

  loading = false;

  @Mutation
  setStudents(students: Student[], pageInfo: PageInfo, total: number) {
    this.students = students;
    this.pageInfo = pageInfo;
    this.totalCount = total;
  }

  @Mutation
  setSelectedStudent(student: Student) {
    this.selectedStudent = student;
  }

  @Mutation
  setStudentsLoading(loading: boolean) {
    this.loading = loading;
  }
}

const StudentModule = getModule(StudentState);
export default StudentModule;
