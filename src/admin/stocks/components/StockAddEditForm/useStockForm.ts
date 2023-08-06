// Types
import type { ComputedRef, Ref } from 'vue';
import type { Stock } from '@/common/services/stock';
import type { IMoney } from '@/common/utils/Money';

// Core
import { reactive, computed, isReactive, toRefs } from 'vue';

// Composables
import useValidation from '@/common/composables/useValidation';
import validateSymbolUnique from '@/common/validators/validateSymbolUnique';

// Utils
import Money from '@/common/utils/Money';
import validateStringLength from '@/common/validators/validateStringLength';

export interface StockDTO {
  id: number;
  name: string;
  symbol: string;
  rawDescription: string;
  currentValue: IMoney;
}

export interface StockErrorsDTO {
  name: string;
  symbol: string;
  currentValue: string;
}

export interface UseStockForm {
  data: StockDTO;
  errors: StockErrorsDTO;
  isValid: ComputedRef<boolean>;
  isDirty: ComputedRef<boolean>;
  loading: Ref<boolean>;
  reset: (stock?: Stock) => void;
}

export function buildFormData(): StockDTO {
  return reactive<StockDTO>({
    id: -1,
    name: '',
    symbol: '',
    rawDescription: '',
    currentValue: Money.fromNumber(0),
  });
}

export function buildErrorData(): StockErrorsDTO {
  return reactive<StockErrorsDTO>({
    name: '',
    symbol: '',
    currentValue: '',
  });
}

export default function useStockForm(
  d?: StockDTO,
  e?: StockErrorsDTO
): UseStockForm {
  if (d && !isReactive(d)) {
    throw new Error('[useStockForm] Data must be reactive.');
  }

  if (e && !isReactive(e)) {
    throw new Error('[useStockForm] Errors must be reactive.');
  }

  const data = d ?? buildFormData();

  const dataRefs = toRefs(data);

  const errors = e ?? buildErrorData();

  const errorRefs = toRefs(errors);

  const originalData = buildFormData();

  useValidation(validateStringLength(3), {
    value: dataRefs.name,
    error: errorRefs.name,
    immediate: true,
  });

  const { loading } = useValidation(validateSymbolUnique(dataRefs.id), {
    value: dataRefs.symbol,
    error: errorRefs.symbol,
    immediate: true,
    debounceTime: 100,
  });

  const isValid = computed(
    () => !Object.values(errors).some((x) => x.length > 0)
  );

  const isDirty = computed(() => {
    if (data.name !== originalData.name) return true;
    if (data.symbol !== originalData.symbol) return true;

    const m = data.currentValue.compare(originalData.currentValue as Money);
    if (m !== 0) return true;

    if (data.rawDescription !== originalData.rawDescription) return true;
    return false;
  });

  function reset(stock?: Stock) {
    errors.name = '';
    errors.symbol = '';
    errors.currentValue = '';

    data.id = stock?.id ?? -1;
    data.name = stock?.name ?? '';
    data.symbol = stock?.symbol ?? '';
    data.rawDescription = stock?.rawDescription ?? '';
    data.currentValue = Money.fromNumber(stock?.currentValue ?? 0);

    originalData.id = stock?.id ?? -1;
    originalData.name = stock?.name ?? '';
    originalData.symbol = stock?.symbol ?? '';
    originalData.rawDescription = stock?.rawDescription ?? '';
    originalData.currentValue = Money.fromNumber(stock?.currentValue ?? 0);
  }

  return {
    data,
    errors,
    loading,
    isValid,
    isDirty,
    reset,
  };
}
