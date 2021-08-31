import { reactive, computed } from 'vue';
import { FETCH_OPTIONS } from '@/constants';

// Services
import { getSharesByStudentId } from '@/services/share';

import {
  TransactionFetchOptions,
  getTransactions,
} from '@/services/transaction';

// Stores
import { setup as defineStockStore } from '@/stores/stock';
import { setup as defineStudentStockStore } from '@/stores/studentStock';
import { setup as defineStockHistoryStore } from '@/stores/stockHistory';

/**
 * Global store with modules that serves as the overall application state.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function setup() {
  const stocksAvailable = defineStockStore();
  const stocksHeld = defineStudentStockStore();
  const stockHistory = defineStockHistoryStore();

  const store = reactive({
    shares: [] as Share[],
    selectedShare: null as Share | null,

    shareTransactions: [] as Transaction[],
    shareTransactionsLoading: false,
    shareTransactionsFetchCount: FETCH_OPTIONS.DEFAULT_COUNT,
    shareTransactionsPageInfo: null as PageInfo|null,
    shareTransactionsTotalCount: 0,
    shareTransactionCursorStack: [] as string[],
  });

  const shares = computed(() => store.shares);

  const selectedShare = computed({
    get: () => store.selectedShare,
    set: (val) => { store.selectedShare = val; },
  });

  const shareTransactions = computed(() => store.shareTransactions);

  const shareTransactionsLoading = computed(() => store.shareTransactionsLoading);

  const shareTransactionsFetchCount = computed(() => store.shareTransactionsFetchCount);

  const shareTransactionsPageInfo = computed(() => store.shareTransactionsPageInfo);

  const shareTransactionsTotalCount = computed(() => store.shareTransactionsTotalCount);

  const shareTransactionsHasPreviousPage = computed(() => store.shareTransactionsPageInfo?.hasPreviousPage ?? false);

  const shareTransactionsHasNextPage = computed(() => store.shareTransactionsPageInfo?.hasNextPage ?? false);

  const shareTransactionsTotalPages = computed(() => {
    if (store.shareTransactionsTotalCount > 0) {
      return Math.ceil(store.shareTransactionsTotalCount / store.shareTransactionsFetchCount);
    }

    return 0;
  });

  /**
   * Fetch shares from the API for the current student.
   *
   * @throws {Error} If there was an error loading data from the API.
   */
  async function fetchShares(studentId: number, cache = true) {
    const res = await getSharesByStudentId({
      studentId,
      cache,
    });

    store.shares = res.shares.nodes;
  }

  /**
   * Fetch the initial list of transactions
   *
   * @param options
   */
  async function fetchShareTransactions(options: TransactionFetchOptions) {
    const opts = {
      cache: false,
      first: store.shareTransactionsFetchCount,
      ...options,
    };

    store.shareTransactionsLoading = true;

    try {
      const data = await getTransactions(opts);
      store.shareTransactions = data.transactions.nodes;
      store.shareTransactionsPageInfo = data.transactions.pageInfo;
      store.shareTransactionsTotalCount = data.transactions.totalCount;
      store.shareTransactionsFetchCount = opts.first;
      store.shareTransactionCursorStack = [];
    } finally {
      store.shareTransactionsLoading = false;
    }
  }

  /**
   * Fetch the next page of transactions
   */
  async function fetchNextShareTransactions() {
    const { targetShareId } = store.shareTransactions[0] ?? { targetShareId: -1 };
    const endCursor = store.shareTransactionsPageInfo?.endCursor ?? '';
    store.shareTransactionsLoading = true;

    try {
      const data = await getTransactions({
        shareId: targetShareId,
        first: store.shareTransactionsFetchCount,
        after: endCursor,
      });

      store.shareTransactionCursorStack = [...store.shareTransactionCursorStack, endCursor];
      store.shareTransactions = data.transactions.nodes;
      store.shareTransactionsPageInfo = data.transactions.pageInfo;
      store.shareTransactionsTotalCount = data.transactions.totalCount;
    } finally {
      store.shareTransactionsLoading = false;
    }
  }

  /**
   * Fetch the previous page of transactions
   */
  async function fetchPreviousShareTransactions() {
    const { targetShareId } = store.shareTransactions[0] ?? { targetShareId: -1 };
    store.shareTransactionsLoading = true;

    try {
      const stack = [...store.shareTransactionCursorStack];
      stack.pop();

      const data = await getTransactions({
        shareId: targetShareId,
        first: store.shareTransactionsFetchCount,
        after: stack[stack.length - 1] ?? null,
      });

      store.shareTransactionCursorStack = stack;
      store.shareTransactions = data.transactions.nodes;
      store.shareTransactionsPageInfo = data.transactions.pageInfo;
      store.shareTransactionsTotalCount = data.transactions.totalCount;
    } finally {
      store.shareTransactionsLoading = false;
    }
  }

  /**
   * Reset stored transactions to an empty list.
   */
  function clearTransactions() {
    store.shareTransactions = [];
    store.shareTransactionsPageInfo = null;
    store.shareTransactionsTotalCount = 0;
  }

  /**
   * Dispose of the store, unsubscribing from any observed events.
   */
  function dispose() {
    stocksAvailable.dispose();
    stocksHeld.dispose();
    stockHistory.dispose();
  }

  return {
    stocksAvailable,
    stockHistory,
    stocksHeld,

    shares,
    selectedShare,
    fetchShares,

    shareTransactions,
    shareTransactionsLoading,
    shareTransactionsFetchCount,
    shareTransactionsPageInfo,
    shareTransactionsTotalCount,
    shareTransactionsHasPreviousPage,
    shareTransactionsHasNextPage,
    shareTransactionsTotalPages,
    fetchShareTransactions,
    fetchNextShareTransactions,
    fetchPreviousShareTransactions,
    clearTransactions,

    dispose,
  };
}

export type GlobalStore = ReturnType<typeof setup>;
