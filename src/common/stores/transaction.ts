// Types
import type { Transaction } from '@/common/services/transaction';

// Core
import { computed, reactive } from 'vue';

// Services
import { publish } from '@/common/services/eventBus';
import { getTransactions, newTransaction } from '@/common/services/transaction';

// Composables
import usePagination from '@/common/composables/usePagination';

// Events
import { newTransaction as transactionEventSymbol } from '@/common/events';

/**
 * Stores information about a share's transactions.
 */
export function setup() {
  const store = reactive({
    loading: false,
    transactions: [] as Transaction[],
    shareId: -1,
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

      store.shareId = options.shareId;
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

  /**
   * Create a new transaction and refresh the store's data.
   *
   * Fires an event to notify listeners a new transaction has been posted.
   */
  async function create(input: Parameters<typeof newTransaction>[0]) {
    const data = await newTransaction(input);

    if (input.shareId === store.shareId) {
      store.loading = true;

      try {
        await fetch({
          shareId: store.shareId,
          first: pageSize.value,
          cache: false,
        });
      } finally {
        store.loading = false;
      }
    }

    publish(transactionEventSymbol, data.newTransaction);
    return data.newTransaction;
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

    // CRUD
    create,
  };
}

export type TransactionStore = ReturnType<typeof setup>;
