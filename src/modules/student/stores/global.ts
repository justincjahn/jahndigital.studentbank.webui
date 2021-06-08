import { reactive, computed } from 'vue';
import { getSharesByStudentId } from '@/services/share';
import * as transactionService from '@/services/transaction';
import * as stockService from '@/services/stock';
import { FETCH_OPTIONS } from '@/constants';

export function setup() {
  const store = reactive({
    shares: [] as Share[],
    selectedShare: null as Share | null,

    shareTransactionsLoading: false,
    shareTransactionsTotalCount: 0,
    shareTransactionsPageInfo: null as PageInfo|null,
    shareTransactionsFetchCount: FETCH_OPTIONS.DEFAULT_COUNT,
    shareTransactionCursorStack: [] as string[],
    shareTransactions: [] as Transaction[],

    stocksAvailableLoading: false,
    stocksAvailableTotalCount: 0,
    stocksAvailablePageInfo: null as PageInfo | null,
    stocksAvailableFetchCount: FETCH_OPTIONS.DEFAULT_COUNT,
    stocksAvailableCursorStack: [] as string[],
    stocksAvailable: [] as Stock[],

    stocksHeldLoading: false,
    stocksHeldTotalCount: 0,
    stocksHeldPageInfo: null as PageInfo | null,
    stocksHeldFetchCount: FETCH_OPTIONS.DEFAULT_COUNT,
    stocksHeldCursorStack: [] as string[],
    stocksHeld: [] as StudentStock[],
  });

  const shares = computed(() => store.shares);

  const selectedShare = computed({
    get: () => store.selectedShare,
    set: (value: Share | null) => {
      store.selectedShare = value;
    },
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

  const stocksAvailable = computed(() => store.stocksAvailable);

  const stocksAvailableLoading = computed(() => store.stocksAvailableLoading);

  const stocksAvailableFetchCount = computed(() => store.stocksAvailableFetchCount);

  const stocksAvailablePageInfo = computed(() => store.stocksAvailablePageInfo);

  const stocksAvailableTotalCount = computed(() => store.stocksAvailableTotalCount);

  const stocksAvailableHasPreviousPage = computed(() => store.stocksAvailablePageInfo?.hasPreviousPage ?? false);

  const stocksAvailableHasNextPage = computed(() => store.stocksAvailablePageInfo?.hasNextPage ?? false);

  const stocksAvailableTotalPages = computed(() => {
    if (store.stocksAvailableTotalCount > 0) {
      return Math.ceil(store.stocksAvailableTotalCount / store.stocksAvailableFetchCount);
    }

    return 0;
  });

  const stocksHeld = computed(() => store.stocksHeld);

  const stocksHeldLoading = computed(() => store.stocksHeldLoading);

  const stocksHeldFetchCount = computed(() => store.stocksHeldFetchCount);

  const stocksHeldPageInfo = computed(() => store.stocksHeldPageInfo);

  const stocksHeldTotalCount = computed(() => store.stocksHeldTotalCount);

  const stocksHeldHasPreviousPage = computed(() => store.stocksHeldPageInfo?.hasPreviousPage ?? false);

  const stocksHeldHasNextPage = computed(() => store.stocksHeldPageInfo?.hasNextPage ?? false);

  const stocksHeldTotalPages = computed(() => {
    if (store.stocksHeldTotalCount > 0) {
      return Math.ceil(store.stocksHeldTotalCount / store.stocksHeldFetchCount);
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
  async function fetchShareTransactions(options: transactionService.FetchOptions) {
    const opts = {
      cache: false,
      first: store.shareTransactionsFetchCount,
      ...options,
    };

    store.shareTransactionsLoading = true;

    try {
      const data = await transactionService.getTransactions(opts);
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
      const data = await transactionService.getTransactions({
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

      const data = await transactionService.getTransactions({
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
   * Fetch a list of stocks available to the student.
   *
   * @param options
   */
  async function fetchStocksAvailable(options?: stockService.StockListOptions) {
    const opts = {
      cache: false,
      first: store.stocksAvailableFetchCount,
      ...options,
    };

    store.stocksAvailableLoading = true;

    try {
      const data = await stockService.getStocks(opts);
      store.stocksAvailable = data.stocks.nodes;
      store.stocksAvailablePageInfo = data.stocks.pageInfo;
      store.stocksAvailableTotalCount = data.stocks.totalCount;
      store.stocksAvailableFetchCount = opts.first;
      store.stocksAvailableCursorStack = [];
    } finally {
      store.stocksAvailableLoading = false;
    }
  }

  /**
   * Fetch the next page of stocks available to the student.
   */
  async function fetchNextStocksAvailable() {
    const endCursor = store.stocksAvailablePageInfo?.endCursor ?? '';
    store.stocksAvailableLoading = true;

    try {
      const data = await stockService.getStocks({
        first: store.stocksAvailableFetchCount,
        after: endCursor,
      });

      store.stocksAvailableCursorStack = [...store.stocksAvailableCursorStack, endCursor];
      store.stocksAvailable = data.stocks.nodes;
      store.stocksAvailablePageInfo = data.stocks.pageInfo;
      store.stocksAvailableTotalCount = data.stocks.totalCount;
    } finally {
      store.stocksAvailableLoading = false;
    }
  }

  /**
   * Fetch the previous page of stocks available to the student.
   */
  async function fetchPreviousStocksAvailable() {
    store.stocksAvailableLoading = true;

    try {
      const stack = [...store.stocksAvailableCursorStack];
      stack.pop();

      const data = await stockService.getStocks({
        first: store.stocksAvailableFetchCount,
        after: stack[stack.length - 1] ?? null,
      });

      store.stocksAvailableCursorStack = stack;
      store.stocksAvailable = data.stocks.nodes;
      store.stocksAvailablePageInfo = data.stocks.pageInfo;
      store.stocksAvailableTotalCount = data.stocks.totalCount;
    } finally {
      store.stocksAvailableLoading = false;
    }
  }

  /**
   * Reset stored available stocks to an empty list.
   */
  function clearStocksAvailable() {
    store.stocksAvailable = [];
    store.stocksAvailablePageInfo = null;
    store.stocksAvailableTotalCount = 0;
  }

  /**
   * Fetch a list of stocks held by the given student.
   *
   * @param options
   */
  async function fetchStocksHeld(options: stockService.StudentStocksOptions) {
    const opts = {
      cache: false,
      first: store.stocksHeldFetchCount,
      ...options,
    };

    store.stocksHeldLoading = true;

    try {
      const data = await stockService.getStudentStocks(opts);
      store.stocksHeld = data.studentStocks.nodes;
      store.stocksHeldPageInfo = data.studentStocks.pageInfo;
      store.stocksHeldTotalCount = data.studentStocks.totalCount;
      store.stocksHeldFetchCount = opts.first;
      store.stocksHeldCursorStack = [];
    } finally {
      store.stocksHeldLoading = false;
    }
  }

  /**
   * Fetch the next page of stocks held by the student.
   */
  async function fetchNextStocksHeld() {
    const { studentId } = store.stocksHeld[0] ?? { studentId: -1 };
    const endCursor = store.stocksHeldPageInfo?.endCursor ?? '';
    store.stocksHeldLoading = true;

    try {
      const data = await stockService.getStudentStocks({
        first: store.stocksAvailableFetchCount,
        after: endCursor,
        studentId,
      });

      store.stocksHeldCursorStack = [...store.stocksHeldCursorStack, endCursor];
      store.stocksHeld = data.studentStocks.nodes;
      store.stocksHeldPageInfo = data.studentStocks.pageInfo;
      store.stocksHeldTotalCount = data.studentStocks.totalCount;
    } finally {
      store.stocksHeldLoading = false;
    }
  }

  /**
   * Fetch the previous page of stocks available to the student.
   */
  async function fetchPreviousStocksHeld() {
    const { studentId } = store.stocksHeld[0] ?? { studentId: -1 };
    store.stocksHeldLoading = true;

    try {
      const stack = [...store.stocksHeldCursorStack];
      stack.pop();

      const data = await stockService.getStudentStocks({
        first: store.stocksHeldFetchCount,
        after: stack[stack.length - 1] ?? null,
        studentId,
      });

      store.stocksHeldCursorStack = stack;
      store.stocksHeld = data.studentStocks.nodes;
      store.stocksHeldPageInfo = data.studentStocks.pageInfo;
      store.stocksHeldTotalCount = data.studentStocks.totalCount;
    } finally {
      store.stocksHeldLoading = false;
    }
  }

  /**
   * Reset stored held stocks to an empty list.
   */
  function clearStocksHeld() {
    store.stocksHeld = [];
    store.stocksHeldPageInfo = null;
    store.stocksHeldTotalCount = 0;
  }

  /**
   * Dispose of the store, unsubscribing from any observed events.
   */
  function dispose() { /* NOT IMPLEMENTED */ }

  return {
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

    stocksAvailable,
    stocksAvailableLoading,
    stocksAvailableFetchCount,
    stocksAvailablePageInfo,
    stocksAvailableTotalCount,
    stocksAvailableHasPreviousPage,
    stocksAvailableHasNextPage,
    stocksAvailableTotalPages,
    fetchStocksAvailable,
    fetchNextStocksAvailable,
    fetchPreviousStocksAvailable,
    clearStocksAvailable,

    stocksHeld,
    stocksHeldLoading,
    stocksHeldFetchCount,
    stocksHeldPageInfo,
    stocksHeldTotalCount,
    stocksHeldHasPreviousPage,
    stocksHeldHasNextPage,
    stocksHeldTotalPages,
    fetchStocksHeld,
    fetchNextStocksHeld,
    fetchPreviousStocksHeld,
    clearStocksHeld,

    dispose,
  };
}

export type GlobalStore = ReturnType<typeof setup>;
