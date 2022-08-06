import { computed, ComputedRef, isReactive, reactive } from 'vue';

// Utils
import Money from '@/utils/money';

export interface StockDTO {
  id: number;
  symbol: string;
  name: string;
  rawDescription: string;
  currentValue: string;
}

export interface StockErrorsDTO {
  symbol: string;
  name: string;
  currentValue: string;
}

export interface UseStockForm {
  data: StockDTO;
  errors: StockErrorsDTO;
  isValid: ComputedRef<boolean>;
  reset: (stock?: Stock) => void;
}

export function buildFormData(): StockDTO {
  return reactive({
    id: -1,
    symbol: '',
    name: '',
    rawDescription: '',
    currentValue: '0.00',
  });
}

export function buildErrorData(): StockErrorsDTO {
  return reactive({
    symbol: '',
    name: '',
    currentValue: '',
  });
}

export default function useStockForm(d?: StockDTO, e?: StockErrorsDTO): UseStockForm {
  if (d && !isReactive(d)) {
    throw new Error('[useStockForm] Data must be reactive.');
  }

  if (e && !isReactive(e)) {
    throw new Error('[useStockForm] Errors must be reactive.');
  }

  const data = d ?? buildFormData();
  const errors = e ?? buildErrorData();
  const isValid = computed(() => !Object.values(errors).some((x) => x.length > 0));

  function reset(stock?: Stock) {
    data.id = stock?.id ?? -1;
    data.symbol = stock?.symbol ?? '';
    data.name = stock?.name ?? '';
    data.rawDescription = stock?.rawDescription ?? '';
    data.currentValue = Money.fromNumber(stock?.currentValue ?? 0).getAmount().toString();

    errors.symbol = '';
    errors.name = '';
    errors.currentValue = '';
  }

  return {
    data,
    errors,
    isValid,
    reset,
  };
}
