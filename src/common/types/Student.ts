import type { Share } from './Share';
import type { Group } from './Group';

export interface Student {
  id: number;
  accountNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  dateLastLogin: string;
  dateRegistered: string;
  groupId: number;
  shares?: Share[];
  group?: Group;
}
