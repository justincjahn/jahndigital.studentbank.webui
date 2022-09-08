import { create } from '@/common/services/eventBus';
import { UserInfo } from '@/common/types/UserInfo';
import { StudentInfo } from '@/common/types/StudentInfo';

export const userLogin = create<UserInfo | StudentInfo>('user-login');

export const userLogout = create('user-logout');
