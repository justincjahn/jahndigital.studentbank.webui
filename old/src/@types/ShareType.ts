import type { PeriodStrings } from './PeriodStrings';
import type { ShareTypeInstances } from './ShareTypeInstances';

export interface ShareType {
  id: number;
  name: string;
  dividendRate: number;
  withdrawalLimitCount: number;
  withdrawalLimitPeriod: PeriodStrings;
  withdrawalLimitLastReset: string;
  withdrawalLimitShouldFee: boolean;
  withdrawalLimitFee: number;
  shareTypeInstances: ShareTypeInstances[];
}
