import type { ShareType } from './ShareType';

export interface Share {
  id: number;
  studentId: number;
  shareTypeId: number;
  balance: number;
  limitedWithdrawalCount: number;
  shareType?: ShareType;
}
