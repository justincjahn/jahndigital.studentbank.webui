import type { UserInfo, StudentInfo } from '@/common/stores/user';
import type { Transaction } from '@/common/services/transaction';
import type { StudentStock } from '@/common/services/stock';
import { create } from '@/common/services/eventBus';

// Fired when a user logs in to the application successfully
export const userLogin = create<UserInfo | StudentInfo>('user-login');

// Fired when a user logs out of the application
export const userLogout = create('user-logout');

// Fired when a new error is logged in the errorStore
export const newError = create<string | null>('error-new');

// Fired when a new transaction is posted
export const newTransaction = create<Transaction>('transaction-new');

// Fired when a new stock is purchased or sold
export const newStockTransaction = create<StudentStock>('transaction-stock');
