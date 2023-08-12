import type { StockStore } from '@/admin/common/stores/stock';
import type { Stock, StockHistory } from '@/common/services/stock';

import { reactive, computed, watchEffect } from 'vue';

import usePagination from '@/common/composables/usePagination';

import { getStockHistory, purgeStockHistory } from '@/common/services/stock';

export function setup(stockStore?: StockStore) {
  const store = reactive({
    loading: false,
    stockId: -1,
    history: [] as StockHistory[],
  });

  const loading = computed(() => store.loading);

  const history = computed(() => store.history);

  const {
    totalCount,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    fetch,
    fetchNext,
    fetchPrevious,
  } = usePagination<Parameters<typeof getStockHistory>[0]>({
    async fetch(options, size) {
      const opts = {
        first: size,
        cache: true,
        ...options,
      };

      store.stockId = options.stockId;
      store.loading = true;

      try {
        const data = await getStockHistory(opts);

        if (!data.stockHistory) {
          throw new Error('No data returned.');
        }

        store.history = data.stockHistory.nodes ?? [];

        return {
          pageInfo: data.stockHistory.pageInfo,
          totalCount: data.stockHistory.totalCount,
        };
      } finally {
        store.loading = false;
      }
    },

    async fetchNext(cursor, size) {
      store.loading = true;

      try {
        const data = await getStockHistory({
          stockId: store.stockId,
          first: size,
          after: cursor,
        });

        if (!data.stockHistory) {
          throw new Error('No data returned.');
        }

        store.history = data.stockHistory.nodes ?? [];

        return {
          pageInfo: data.stockHistory.pageInfo,
          totalCount: data.stockHistory.totalCount,
        };
      } finally {
        store.loading = false;
      }
    },

    async fetchPrevious(cursor, size) {
      store.loading = true;

      try {
        const data = await getStockHistory({
          stockId: store.stockId,
          first: size,
          after: cursor,
        });

        if (!data.stockHistory) {
          throw new Error('No data returned.');
        }

        return {
          pageInfo: data.stockHistory.pageInfo,
          totalCount: data.stockHistory.totalCount,
        };
      } finally {
        store.loading = false;
      }
    },
  });

  /**
   * Purge the history of a Stock up to a given date.
   *
   * @param stock The stock whose history to purge.
   * @param date The date in yyyy-mm-dd format to use as a cutoff.
   */
  async function purgeHistory(stock: Stock, date: string) {
    const data = await purgeStockHistory(stock, date);

    if (!data.purgeStockHistory) {
      throw new Error('Unable to purge stock history: Unknown reason.');
    }

    if (stock.id === store.stockId) {
      fetch({
        stockId: store.stockId,
        cache: false,
      });
    }

    return data;
  }

  watchEffect(() => {
    if (!stockStore) return;

    if (stockStore.selected.value === null) {
      store.history = [];
    } else {
      fetch({
        stockId: stockStore.selected.value.id,
      });
    }
  });

  return {
    // State
    loading,
    history,

    // Pagination
    totalCount,
    totalPages,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    fetch,
    fetchNext,
    fetchPrevious,

    // CRUD
    purgeHistory,
  };
}

export type StockHistoryStore = ReturnType<typeof setup>;
