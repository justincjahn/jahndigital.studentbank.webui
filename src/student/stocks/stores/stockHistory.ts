import type { StockHistory } from '@/common/services/stock';

// Core
import { reactive, toRef } from 'vue';

// Composables
import usePagination from '@/common/composables/usePagination';

// GraphQL
import { getStockHistory } from '@/common/services/stock';

/**
 * Stores information about stock history in the system.
 */
export function setup() {
  const store = reactive({
    loading: false,
    history: [] as StockHistory[],
  });

  // True if the store is loading data
  const loading = toRef(() => store.loading);

  // Get a list of fetched stocks
  const history = toRef(() => store.history);

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

      store.loading = true;

      try {
        const data = await getStockHistory(opts);

        if (!data.stockHistory || !data.stockHistory.nodes) {
          throw new Error('No data returned');
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
          stockId: store.history[0].stockId,
          first: size,
          after: cursor,
        });

        if (!data.stockHistory || !data.stockHistory.nodes) {
          throw new Error('No data returned');
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
          stockId: store.history[0].stockId,
          first: size,
          after: cursor,
        });

        if (!data.stockHistory || !data.stockHistory.nodes) {
          throw new Error('No data returned');
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
  });

  function dispose() {}

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

    dispose,
  };
}

export type StockHistoryStore = ReturnType<typeof setup>;
