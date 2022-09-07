import type { Role } from './Role';

export interface UserInfo {
  id: number;
  email: string;
  roleId: number;
  role: Role;
}
