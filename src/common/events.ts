import type { UserInfo, StudentInfo } from '@/common/stores/user';
import { create } from '@/common/services/eventBus';

// Fired when a user logs in to the application successfully
export const userLogin = create<UserInfo | StudentInfo>('user-login');

// Fired when a user logs out of the application
export const userLogout = create('user-logout');
