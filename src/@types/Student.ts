/* eslint-disable import/no-cycle */

import Share from './Share';
import Group from './Group';

type Student = {
  id: number;

  accountNumber: string;

  firstName: string;

  lastName: string;

  groupId: number;

  shares?: Share[];

  group?: Group;

  email: string;
}

export default Student;
