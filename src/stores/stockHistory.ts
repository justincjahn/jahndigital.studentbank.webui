import { FETCH_OPTIONS } from '@/constants';
import { computed, reactive } from 'vue';
import { getStockHistory } from '@/services/stock';
import { stockUpdate } from '@/events';
import { subscribe } from '@/services/eventBus';

interface FetchOptions {
  stockId: number;
  first?: number;
  cache?: boolean;
}

/**
 * Stores information about the history of a stock in the system and enables pagination.
 */
export function setup() {
  const store = reactive({
    loading: false,
    totalCount: 0,
    pageInfo: null as PageInfo | null,
    pageCount: FETCH_OPTIONS.DEFAULT_COUNT,
    cursorStack: [] as string[],
    stockId: -1,
    history: [] as StockHistory[],
  });

  const loading = computed(() => store.loading);

  const pageCount = computed(() => store.pageCount);

  const totalCount = computed(() => store.totalCount);

  const hasNextPage = computed(() => store.pageInfo?.hasNextPage ?? false);

  const hasPreviousPage = computed(() => store.pageInfo?.hasPreviousPage ?? false);

  const totalPages = computed(() => {
    if (store.totalCount > 0) {
      return Math.ceil(store.totalCount / store.pageCount);
    }

    return 0;
  });

  const history = computed(() => store.history);

  /**
   * Perform an initial fetch of data with the provided options.
   *
   * @param options
   */
  async function fetch(options: FetchOptions) {
    const opts = {
      first: store.pageCount,
      cache: true,
      ...options,
    };

    store.loading = true;

    try {
      const res = await getStockHistory(opts);
      store.stockId = opts.stockId;
      store.history = res.stockHistory.nodes;
      store.pageInfo = res.stockHistory.pageInfo;
      store.totalCount = res.stockHistory.totalCount;
      store.pageCount = opts.first;
      store.cursorStack = [];
    } finally {
      store.loading = false;
    }
  }

  /**
   * Fetch the next page of data, if available.
   */
  async function fetchNext() {
    if (store.stockId === -1) throw new Error('[Stock History Store]: fetchNext was run before fetch.');
    const endCursor = store.pageInfo?.endCursor ?? '';
    store.loading = true;

    try {
      const res = await getStockHistory({
        stockId: store.stockId,
        first: store.pageCount,
        after: endCursor,
      });

      store.cursorStack = [...store.cursorStack, endCursor];
      store.history = res.stockHistory.nodes;
      store.pageInfo = res.stockHistory.pageInfo;
      store.totalCount = res.stockHistory.totalCount;
    } finally {
      store.loading = false;
    }
  }

  /**
   * Fetch the previous page of data, if available.
   */
  async function fetchPrevious() {
    const stack = [...store.cursorStack];
    stack.pop();

    store.loading = true;
    try {
      const res = await getStockHistory({
        stockId: store.stockId,
        first: store.pageCount,
        after: stack[stack.length - 1] ?? null,
      });

      store.cursorStack = stack;
      store.history = res.stockHistory.nodes;
      store.pageInfo = res.stockHistory.pageInfo;
      store.totalCount = res.stockHistory.totalCount;
    } finally {
      store.loading = false;
    }
  }

  /**
   * Clear the data in this store.
   */
  function clear() {
    store.stockId = -1;
    store.history = [];
    store.pageInfo = null;
    store.totalCount = 0;
  }

  // When the currently fetched stock updates, refetch history
  const unsubCreate = subscribe(stockUpdate, (stock) => {
    if (store.stockId !== stock.id) return;

    fetch({
      first: store.pageCount,
      stockId: store.stockId,
      cache: false,
    }).catch((error) => {
      console.error(error);
    });
  });

  /**
   * Unsubscribe from events.
   */
  function dispose() {
    unsubCreate();
  }

  return {
    loading,
    pageCount,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    totalPages,
    history,
    fetch,
    fetchNext,
    fetchPrevious,
    clear,
    dispose,
  };
}

export type ShareStore = ReturnType<typeof setup>;
