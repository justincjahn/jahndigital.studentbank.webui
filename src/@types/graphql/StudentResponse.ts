import Student from '../Student';

type StudentResponse = {
  students: {
    nodes: Student[];
  };
}

export default StudentResponse;
