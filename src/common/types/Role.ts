import type { Privilege } from './Privilege';

export interface Role {
  description: string;
  rolePrivileges: Privilege[];
}
