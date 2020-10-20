import Share from './Share';

type Student = {
  id: number;

  accountNumber: string;

  firstName: string;

  lastName: string;

  shares?: Share[];
}

export default Student;
