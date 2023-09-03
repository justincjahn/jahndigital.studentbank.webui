import { computed, reactive } from 'vue';

// Types
import type { Stock } from '@/common/services/stock';

// Composables
import usePagination from '@/common/composables/usePagination';

// GraphQL
import { getStocks, getStudentStockHistory } from '@/common/services/stock';
import { newStockPurchase } from '@/common/services/transaction';

// Events
import { publish } from '@/common/services/eventBus';
import { newTransaction, newStockTransaction } from '@/common/events';
import { SortEnumType } from '@/generated/graphql';

/**
 * Stores information about stocks in the system.
 */
export function setup() {
  const store = reactive({
    loading: false,
    stocks: [] as Stock[],
  });

  // True if the store is loading data
  const loading = computed(() => store.loading);

  // Get a list of fetched stocks
  const stocks = computed(() => store.stocks);

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
        ...options,
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

        store.stocks = data.stocks.nodes ?? [];

        return {
          pageInfo: data.stocks.pageInfo,
          totalCount: data.stocks.totalCount,
        };
      } finally {
        store.loading = false;
      }
    },
  });

  async function purchase(input: Parameters<typeof newStockPurchase>[0]) {
    store.loading = true;

    try {
      const data = await newStockPurchase(input);

      if (!data.newStockPurchase) {
        throw new Error('No data returned.');
      }

      const history = await getStudentStockHistory({
        studentStockId: data.newStockPurchase[0].id,
        first: 1,
        order: {
          datePosted: SortEnumType.Desc,
        },
        cache: false,
      });

      if (!history.studentStockHistory || !history.studentStockHistory.nodes) {
        throw new Error(
          'Unable to locate the transaction from the stock purchase.'
        );
      }

      publish(newStockTransaction, data.newStockPurchase[0]);
      publish(newTransaction, history.studentStockHistory.nodes[0].transaction);
      return data.newStockPurchase[0];
    } finally {
      store.loading = false;
    }
  }

  function dispose() {}

  return {
    // State
    loading,
    stocks,

    // Pagination
    totalCount,
    totalPages,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    fetch,
    fetchNext,
    fetchPrevious,

    purchase,
    dispose,
  };
}

export type StockStore = ReturnType<typeof setup>;
