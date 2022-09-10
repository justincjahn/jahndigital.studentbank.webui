import type { Student } from './Student';
import type { Instance } from './Instance';

export interface Group {
  id: number;
  instanceId: number;
  name: string;
  students?: Student[];
  instance?: Instance;
}
