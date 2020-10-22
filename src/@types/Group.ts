import Student from './Student';

type Group = {
  id: number;

  instanceId: number;

  name: string;

  students?: Student[];
}

export default Group;
