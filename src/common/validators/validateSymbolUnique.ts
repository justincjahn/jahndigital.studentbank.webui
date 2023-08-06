import { Ref, unref } from 'vue';
import { getStockBySymbol } from '@/common/services/stock';
import validateStringLength from './validateStringLength';

const validateLength = validateStringLength(3);

export default function validateSymbolUnique(stockId?: Ref<number>) {
  return async (value: string): Promise<string | boolean> => {
    const error = validateLength(value);
    if (error !== true) return error;

    try {
      const res = await getStockBySymbol({
        symbol: value.trim(),
        cache: false,
      });

      if (typeof stockId !== 'undefined') {
        if (res?.id === unref(stockId)) return true;
      }

      if (res) {
        return `A stock with the symbol ${value} already exists.`;
      }

      return true;
    } catch {
      return 'Unable to contact server, please try again later.';
    }
  };
}
