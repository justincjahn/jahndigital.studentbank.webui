/* eslint-disable import/no-cycle */
import Instance from './Instance';
import Student from './Student';

type Group = {
  id: number;

  instanceId: number;

  name: string;

  students?: Student[];

  instance?: Instance;
}

export default Group;
