import { computed, reactive } from 'vue';

// Types
import type { Stock } from '@/common/services/stock';

// Composables
import usePagination from '@/common/composables/usePagination';

// GraphQL
import { getStocks } from '@/common/services/stock';

/**
 * Stores information about stocks in the system.
 */
export function setup() {
  const store = reactive({
    loading: false,
    stocks: [] as Stock[],
    selected: null as Stock | null,
  });

  // True if the store is loading data
  const loading = computed(() => store.loading);

  // Get a list of fetched stocks
  const stocks = computed(() => store.stocks);

  // Get or set the selected stock
  const selected = computed({
    get: () => store.selected,
    set(value) {
      store.selected = value;
    },
  });

  const {
    totalCount,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    fetch,
    fetchNext,
    fetchPrevious,
  } = usePagination<Parameters<typeof getStocks>[0]>({
    async fetch(options, size) {
      const opts = {
        first: size,
        cache: true,
      };

      store.loading = true;

      try {
        const data = await getStocks(opts);

        if (!data.stocks) {
          throw new Error('No data returned');
        }

        store.stocks = data.stocks.nodes ?? [];

        return {
          pageInfo: data.stocks.pageInfo,
          totalCount: data.stocks.totalCount,
        };
      } finally {
        store.loading = false;
      }
    },

    async fetchNext(cursor, size) {
      store.loading = true;

      try {
        const data = await getStocks({
          first: size,
          after: cursor,
        });

        if (!data.stocks) {
          throw new Error('No data returned');
        }

        store.stocks = data.stocks.nodes ?? [];

        return {
          pageInfo: data.stocks.pageInfo,
          totalCount: data.stocks.totalCount,
        };
      } finally {
        store.loading = false;
      }
    },

    async fetchPrevious(cursor, size) {
      store.loading = true;

      try {
        const data = await getStocks({
          first: size,
          after: cursor,
        });

        if (!data.stocks) {
          throw new Error('No data returned');
        }

        return {
          pageInfo: data.stocks.pageInfo,
          totalCount: data.stocks.totalCount,
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
    stocks,
    selected,

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

export type StockStore = ReturnType<typeof setup>;
