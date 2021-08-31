import { ref, computed, Ref, ComputedRef } from 'vue';
import Money from '@/utils/money';

export interface UseTransactionCalculationsOptions {
  initialBalance: string;
}

export interface UseTransactionCalculations {
  amount: Ref<string>;
  amountMoney: ComputedRef<Money>;
  withdrawalLimitError: ComputedRef<boolean>;
  withdrawalLimitFeeError: ComputedRef<boolean>;
  feeAmount: ComputedRef<Money>;
  remainingBalance: ComputedRef<Money>;
}

export default function useTransactionCalculations(
  share: () => Share | null,
  options?: UseTransactionCalculationsOptions,
): UseTransactionCalculations {
  const opts = {
    initialBalance: '0.00',
    ...options,
  };

  const amount = ref<string>(opts.initialBalance);
  const amountMoney = computed(() => Money.fromStringOrDefault(amount.value.toString()));

  const withdrawalLimitError = computed(() => {
    const sh = share();

    if (!sh) return false;
    if (!sh.shareType) {
      throw new Error('[Use Transaction Calculations] No ShareType present on the provided share.');
    }

    if (sh.shareType.withdrawalLimitCount <= 0) return false;
    if (sh.limitedWithdrawalCount >= sh.shareType.withdrawalLimitCount) return true;
    return false;
  });

  const withdrawalLimitFeeError = computed(() => {
    const sh = share();

    if (!sh) return false;
    if (!sh.shareType) {
      throw new Error('[Use Transaction Calculations] No ShareType present on the provided share.');
    }

    if (!withdrawalLimitError.value) return false;
    if (sh.shareType.withdrawalLimitShouldFee ?? false) return true;
    return false;
  });

  const feeAmount = computed(() => {
    const sh = share();

    if (!sh) return Money.fromNumber(0);
    if (!sh.shareType) {
      throw new Error('[Use Transaction Calculations] No ShareType present on the provided share.');
    }

    if (withdrawalLimitFeeError.value) {
      return Money.fromNumber(sh.shareType.withdrawalLimitFee ?? 0);
    }

    return Money.fromNumber(0);
  });

  const remainingBalance = computed(() => {
    const transferAmount = Money.fromStringOrDefault(amount.value.toString()).add(feeAmount.value);
    const shareBalance = Money.fromNumber(share()?.balance ?? 0);
    return shareBalance.sub(transferAmount);
  });

  return {
    amount,
    amountMoney,
    withdrawalLimitError,
    withdrawalLimitFeeError,
    feeAmount,
    remainingBalance,
  };
}
