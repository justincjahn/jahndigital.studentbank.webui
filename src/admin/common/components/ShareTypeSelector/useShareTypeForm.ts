import { reactive, computed, isReactive, toRefs } from 'vue';

// Composables
import useValidation from '@/common/composables/useValidation';

// Validators
import validateStringLength from '@/common/validators/validateStringLength';
import validateAmountNonnegative from '@/common/validators/validateAmountNonnegative';
import validateRateNonnegative from '@/common/validators/validateRateNonnegative';
import validateNumberPositive from '@/common/validators/validateNumberPositive';

// Types
import type { ComputedRef } from 'vue';
import { ShareType, Period } from '@/admin/common/services/shareType';

export interface ShareTypeDTO {
  id: number;
  name: string;
  dividendRate: string;
  withdrawalLimitCount: string;
  withdrawalLimitPeriod: Period;
  withdrawalLimitShouldFee: boolean;
  withdrawalLimitFee: string;
}

export interface ShareTypeErrorsDTO {
  name: string;
  dividendRate: string;
  maximumWithdrawals: string;
  withdrawalLimitCount: string;
  withdrawalLimitFee: string;
}

export interface UseShareTypeForm {
  data: ShareTypeDTO;
  errors: ShareTypeErrorsDTO;
  isValid: ComputedRef<boolean>;
  reset: (shareType?: ShareType) => void;
}

export function buildFormData() {
  return reactive<ShareTypeDTO>({
    id: -1,
    name: '',
    dividendRate: '0.0000',
    withdrawalLimitCount: '0',
    withdrawalLimitPeriod: Period.Daily,
    withdrawalLimitShouldFee: false,
    withdrawalLimitFee: '',
  });
}

export function buildErrorData() {
  return reactive<ShareTypeErrorsDTO>({
    name: '',
    dividendRate: '',
    maximumWithdrawals: '',
    withdrawalLimitCount: '',
    withdrawalLimitFee: '',
  });
}

export default function useShareTypeForm(
  d?: ShareTypeDTO,
  e?: ShareTypeErrorsDTO
): UseShareTypeForm {
  if (d && !isReactive(d)) {
    throw new Error('[useShareTypeForm] Data must be reactive.');
  }

  if (e && !isReactive(e)) {
    throw new Error('[useShareTypeForm] Errors must be reactive.');
  }

  const data = d ?? buildFormData();

  const dataRefs = toRefs(data);

  const errors = e ?? buildErrorData();

  const errorRefs = toRefs(errors);

  useValidation(validateStringLength(3), {
    value: dataRefs.name,
    error: errorRefs.name,
  });

  useValidation(validateRateNonnegative, {
    value: dataRefs.dividendRate,
    error: errorRefs.dividendRate,
  });

  useValidation(validateAmountNonnegative, {
    value: dataRefs.withdrawalLimitFee,
    error: errorRefs.withdrawalLimitFee,
  });

  useValidation(validateNumberPositive, {
    value: dataRefs.withdrawalLimitCount,
    error: errorRefs.withdrawalLimitCount,
  });

  const isValid = computed(
    () => !Object.values(errors).some((x) => x.length > 0)
  );

  function reset(shareType?: ShareType) {
    data.id = shareType?.id ?? -1;
    data.name = shareType?.name ?? '';

    data.dividendRate = shareType?.dividendRate.toString() ?? '0.0000';

    data.withdrawalLimitCount =
      shareType?.withdrawalLimitCount.toString() ?? '0';

    data.withdrawalLimitPeriod =
      shareType?.withdrawalLimitPeriod ?? Period.Daily;

    data.withdrawalLimitShouldFee =
      shareType?.withdrawalLimitShouldFee ?? false;

    data.withdrawalLimitFee =
      shareType?.withdrawalLimitFee.toString() ?? '0.00';

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
