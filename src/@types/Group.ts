import Student from './Student';

type Group = {
  id: number;

  name: string;

  students?: Student[];
}

export default Group;
