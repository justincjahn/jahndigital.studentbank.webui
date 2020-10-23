import Share from './Share';

type Student = {
  id: number;

  accountNumber: string;

  firstName: string;

  lastName: string;

  groupId: number;

  shares?: Share[];

  email: string;
}

export default Student;
