import type { Ref, ComputedRef } from 'vue';
import type { Share } from '@/common/services/share';
import type { IMoney } from '@/common/utils/Money';
import { ref, computed } from 'vue';
import Money from '@/common/utils/Money';

export interface UseTransactionCalculationsOptions {
  initialAmount: IMoney;
}

export interface UseTransactionCalculations {
  amount: Ref<IMoney>;
  fee: ComputedRef<Money>;
  currentBalance: ComputedRef<Money>;
  remainingBalance: ComputedRef<Money>;
  negativeError: ComputedRef<boolean>;
  withdrawalLimitError: ComputedRef<boolean>;
  withdrawalLimitFeeError: ComputedRef<boolean>;
}

export default function useTransactionCalculations(
  share: () => Share | null,
  options?: UseTransactionCalculationsOptions
): UseTransactionCalculations {
  const opts = {
    initialAmount: Money.fromNumber(0),
    ...options,
  };

  const amount = ref<IMoney>(opts.initialAmount);

  const currentBalance = computed(() =>
    Money.fromNumber(share()?.balance ?? 0)
  );

  const withdrawalLimitError = computed(() => {
    const sh = share();

    if (!sh) return false;

    if (!sh.shareType) {
      throw new Error(
        '[Use Transaction Calculations] No ShareType present on the provided share.'
      );
    }

    if (sh.shareType.withdrawalLimitCount <= 0) return false;

    if (sh.limitedWithdrawalCount >= sh.shareType.withdrawalLimitCount) {
      return true;
    }

    return false;
  });

  const withdrawalLimitFeeError = computed(() => {
    const sh = share();

    if (!sh) return false;

    if (!sh.shareType) {
      throw new Error(
        '[Use Transaction Calculations] No ShareType present on the provided share.'
      );
    }

    if (!withdrawalLimitError.value) return false;
    if (sh.shareType.withdrawalLimitFee ?? false) return true;
    return false;
  });

  const fee = computed(() => {
    const sh = share();

    if (!sh) return Money.fromNumber(0);

    if (!sh.shareType) {
      throw new Error(
        '[Use Transaction Calculations] No ShareType present on the provided share.'
      );
    }

    if (withdrawalLimitFeeError.value) {
      return Money.fromNumber(sh.shareType.withdrawalLimitFee ?? 0);
    }

    return Money.fromNumber(0);
  });

  const remainingBalance = computed(() => {
    const transferAmount = amount.value.add(fee.value);
    const shareBalance = Money.fromNumber(share()?.balance ?? 0);
    return shareBalance.sub(transferAmount);
  });

  const negativeError = computed(
    () => remainingBalance.value.compare(0) === -1
  );

  return {
    amount,
    currentBalance,
    fee,
    remainingBalance,
    negativeError,
    withdrawalLimitError,
    withdrawalLimitFeeError,
  };
}
