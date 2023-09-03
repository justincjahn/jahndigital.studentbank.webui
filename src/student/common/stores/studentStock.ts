import { computed, reactive } from 'vue';

// Types
import type { StudentStock } from '@/common/services/stock';

// Composables
import usePagination from '@/common/composables/usePagination';

// GraphQL
import { getStudentStocks } from '@/common/services/stock';

// Events
import { subscribe } from '@/common/services/eventBus';
import { newStockTransaction } from '@/common/events';

/**
 * Stores information about stocks in the system.
 */
export function setup() {
  const store = reactive({
    loading: false,
    stocks: [] as StudentStock[],
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
  } = usePagination<Parameters<typeof getStudentStocks>[0]>({
    async fetch(options, size) {
      const opts = {
        first: size,
        cache: true,
        ...options,
      };

      store.loading = true;

      try {
        const data = await getStudentStocks(opts);

        if (!data.studentStocks) {
          throw new Error('No data returned');
        }

        store.stocks = data.studentStocks.nodes ?? [];

        return {
          pageInfo: data.studentStocks.pageInfo,
          totalCount: data.studentStocks.totalCount,
        };
      } finally {
        store.loading = false;
      }
    },

    async fetchNext(cursor, size) {
      store.loading = true;

      try {
        const data = await getStudentStocks({
          first: size,
          after: cursor,
          studentId: store.stocks[0].studentId,
        });

        if (!data.studentStocks) {
          throw new Error('No data returned');
        }

        store.stocks = data.studentStocks.nodes ?? [];

        return {
          pageInfo: data.studentStocks.pageInfo,
          totalCount: data.studentStocks.totalCount,
        };
      } finally {
        store.loading = false;
      }
    },

    async fetchPrevious(cursor, size) {
      store.loading = true;

      try {
        const data = await getStudentStocks({
          first: size,
          after: cursor,
          studentId: store.stocks[0].studentId,
        });

        if (!data.studentStocks) {
          throw new Error('No data returned');
        }

        store.stocks = data.studentStocks.nodes ?? [];

        return {
          pageInfo: data.studentStocks.pageInfo,
          totalCount: data.studentStocks.totalCount,
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
  async function findById(studentId: number, stockId: number) {
    const data = await getStudentStocks({
      first: 1,
      studentId,
      cache: false,
      where: {
        stockId: {
          eq: stockId,
        },
      },
    });

    if (!data.studentStocks || !data.studentStocks.nodes) {
      throw new Error('No data returned.');
    }

    if (data.studentStocks.nodes.length === 0) {
      return null;
    }

    const studentStock = data.studentStocks.nodes[0];
    const idx = store.stocks.findIndex((x) => x.id === studentStock.id);

    if (idx >= 0) {
      store.stocks.splice(idx, 1, { ...studentStock });
    }

    return studentStock;
  }

  const disposeNewStockTransaction = subscribe(newStockTransaction, (stock) => {
    const idx = store.stocks.findIndex((x) => x.id === stock.id);
    if (idx < 0) return;
    store.stocks.splice(idx, 1, { ...stock });
  });

  function dispose() {
    disposeNewStockTransaction();
  }

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
    dispose,
  };
}

export type StudentStockStore = ReturnType<typeof setup>;
