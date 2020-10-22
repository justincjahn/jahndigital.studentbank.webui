import PageInfo from '../PageInfo';
import Student from '../Student';

type PagedStudentResponse = {
  students: {
    pageInfo: PageInfo;
    totalCount: number;
    nodes: Student[];
  };
}

export default PagedStudentResponse;
