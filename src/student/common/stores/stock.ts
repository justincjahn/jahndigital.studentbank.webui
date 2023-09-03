import type { Stock } from '@/common/services/stock';

// Core
import { computed, reactive } from 'vue';

// Composables
import usePagination from '@/common/composables/usePagination';

// GraphQL
import { getStocks, getStudentStockHistory } from '@/common/services/stock';
import { newStockPurchase } from '@/common/services/transaction';
import { SortEnumType } from '@/generated/graphql';

// Events
import { publish } from '@/common/services/eventBus';
import { newTransaction, newStockTransaction } from '@/common/events';

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

  /**
   * Attempt to find a StudentStock by ID.
   *
   * @param studentId The Student's ID
   * @param stockId The Stock's ID
   * @returns A StudentStock record, or null if nothing was found.
   */
  async function findById(stockId: number) {
    const data = await getStocks({
      first: 1,
      cache: false,
      where: {
        id: {
          eq: stockId,
        },
      },
    });

    if (!data.stocks || !data.stocks.nodes) {
      throw new Error('No data returned.');
    }

    if (data.stocks.nodes.length === 0) {
      return null;
    }

    const [stock] = data.stocks.nodes;
    const newStocks = [...store.stocks];
    const idx = newStocks.findIndex((x) => x.id === stock.id);

    if (idx >= 0) {
      newStocks.splice(idx, 1, stock);
      store.stocks = newStocks;
    }

    return stock;
  }

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

    findById,
    purchase,
    dispose,
  };
}

export type StockStore = ReturnType<typeof setup>;
