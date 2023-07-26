import type { IMoney } from '@/common/utils/Money';
import type { ShareType } from '@/admin/common/services/shareType';

export interface ShareTypeTemplate {
  shareType: ShareType | null;
  initialDeposit: IMoney;
  error: string;
}
