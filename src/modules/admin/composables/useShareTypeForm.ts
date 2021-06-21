import { reactive, computed, isReactive } from 'vue';

// Utils
import Rate from '@/utils/rate';
import Money from '@/utils/money';

export interface ShareTypeDTO {
  id: number;
  name: string;
  dividendRate: string;
  withdrawalLimitCount: string;
  withdrawalLimitPeriod: PeriodStrings;
  withdrawalLimitShouldFee: boolean;
  withdrawalLimitFee: string;
}

export interface ShareTypeErrorsDTO {
  name: string;
  dividendRate: string;
  withdrawalLimitCount: string;
  withdrawalLimitFee: string;
}

export function buildFormData(): ShareTypeDTO {
  return reactive({
    id: -1,
    name: '',
    dividendRate: '',
    withdrawalLimitCount: '0',
    withdrawalLimitPeriod: 'DAILY',
    withdrawalLimitShouldFee: false,
    withdrawalLimitFee: '',
  });
}

export function buildErrorData(): ShareTypeErrorsDTO {
  return reactive({
    name: '',
    dividendRate: '',
    withdrawalLimitCount: '',
    withdrawalLimitFee: '',
  });
}

export default function useShareTypeForm(d?: ShareTypeDTO, e?: ShareTypeErrorsDTO) {
  if (d && !isReactive(d)) {
    throw new Error('[useShareTypeForm] Data must be reactive.');
  }

  if (e && !isReactive(e)) {
    throw new Error('[useShareTypeForm] Errors must be reactive.');
  }

  const data = d ?? buildFormData();
  const errors = e ?? buildErrorData();
  const isValid = computed(() => !Object.values(errors).some((x) => x.length > 0));

  function reset(shareType?: ShareType) {
    data.id = shareType?.id ?? -1;
    data.name = shareType?.name ?? '';
    data.dividendRate = Rate.fromNumber(shareType?.dividendRate ?? 0).toString();
    data.withdrawalLimitCount = shareType?.withdrawalLimitCount.toString() ?? '0';
    data.withdrawalLimitPeriod = shareType?.withdrawalLimitPeriod ?? 'DAILY';
    data.withdrawalLimitShouldFee = shareType?.withdrawalLimitShouldFee ?? false;
    data.withdrawalLimitFee = Money.fromNumber(shareType?.withdrawalLimitFee ?? 0).getAmount().toString();

    errors.name = '';
    errors.dividendRate = '';
    errors.withdrawalLimitCount = '';
    errors.withdrawalLimitFee = '';
  }

  return {
    data,
    errors,
    isValid,
    reset,
  };
}
