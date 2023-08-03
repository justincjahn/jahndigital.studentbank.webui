import { computed, reactive } from 'vue';

import type { Transaction } from '@/common/services/transaction';

import { getTransactions } from '@/common/services/transaction';

import usePagination from '@/common/composables/usePagination';

/**
 * Stores information about a share's transactions.
 */
export function setup() {
  const store = reactive({
    loading: false,
    transactions: [] as Transaction[],
  });

  const loading = computed(() => store.loading);

  const transactions = computed(() => store.transactions);

  const {
    totalCount,
    hasNextPage,
    hasPreviousPage,
    pageSize,
    totalPages,
    clear: clearPagination,
    fetch,
    fetchNext,
    fetchPrevious,
  } = usePagination<Parameters<typeof getTransactions>[0]>({
    async fetch(options, size) {
      const opts = {
        first: size,
        ...options,
      };

      store.loading = true;

      try {
        const data = await getTransactions(opts);

        if (!data.transactions) {
          throw new Error('No data returned.');
        }

        store.transactions = data.transactions.nodes ?? [];

        return {
          pageInfo: data.transactions.pageInfo,
          totalCount: data.transactions.totalCount,
        };
      } finally {
        store.loading = false;
      }
    },

    async fetchNext(cursor, size) {
      const { targetShareId } = store.transactions[0] ?? { targetShareId: -1 };
      store.loading = true;

      try {
        const data = await getTransactions({
          shareId: targetShareId,
          first: size,
          after: cursor,
        });

        if (!data.transactions) {
          throw new Error('No data returned');
        }

        store.transactions = data.transactions.nodes ?? [];

        return {
          pageInfo: data.transactions.pageInfo,
          totalCount: data.transactions.totalCount,
        };
      } finally {
        store.loading = false;
      }
    },

    async fetchPrevious(cursor, size) {
      const { targetShareId } = store.transactions[0] ?? { targetShareId: -1 };
      store.loading = true;

      try {
        const data = await getTransactions({
          shareId: targetShareId,
          first: size,
          after: cursor,
        });

        if (!data.transactions) {
          throw new Error('No data returned');
        }

        store.transactions = data.transactions.nodes ?? [];

        return {
          pageInfo: data.transactions.pageInfo,
          totalCount: data.transactions.totalCount,
        };
      } finally {
        store.loading = false;
      }
    },
  });

  function clear() {
    store.transactions = [];
    clearPagination();
  }

  return {
    // State
    loading,
    transactions,
    clear,

    // Pagination
    totalCount,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    fetch,
    fetchNext,
    fetchPrevious,
  };
}

export type TransactionStore = ReturnType<typeof setup>;
