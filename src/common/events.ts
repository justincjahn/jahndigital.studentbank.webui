import type { UserInfo, StudentInfo } from '@/common/stores/user';
import { create } from '@/common/services/eventBus';
import type { IMoney } from './utils/Money';

// Fired when a user logs in to the application successfully
export const userLogin = create<UserInfo | StudentInfo>('user-login');

// Fired when a user logs out of the application
export const userLogout = create('user-logout');

// Fired when a new error is logged in the errorStore
export const newError = create<string | null>('error-new');

// Fired when a share's balance changes
export interface BalanceChange {
  ShareId: number;
  NewBalance: IMoney;
}

export const shareBalanceChange = create<BalanceChange>('share-balance-change');
