import { computed, reactive } from 'vue';
import { FETCH_OPTIONS } from '@/constants';

// Services
import { StockHistoryListOptions, getStockHistory } from '@/services/stock';

// Events
import { stockUpdate } from '@/events';
import { subscribe } from '@/services/eventBus';

/**
 * Stores information about the history of a stock in the system and enables pagination.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function setup() {
  const store = reactive({
    loading: false,
    totalCount: 0,
    pageInfo: null as PageInfo | null,
    options: null as StockHistoryListOptions | null,
    cursorStack: [] as string[],
    items: [] as StockHistory[],
  });

  const loading = computed(() => store.loading);

  const pageCount = computed(() => store.options?.first ?? FETCH_OPTIONS.DEFAULT_COUNT);

  const totalCount = computed(() => store.totalCount);

  const hasNextPage = computed(() => store.pageInfo?.hasNextPage ?? false);

  const hasPreviousPage = computed(() => store.pageInfo?.hasPreviousPage ?? false);

  const totalPages = computed(() => {
    if (store.totalCount > 0) {
      return Math.ceil(store.totalCount / pageCount.value);
    }

    return 0;
  });

  const items = computed(() => store.items);

  /**
   * Perform an initial fetch of data with the provided options.
   *
   * @param options
   */
  async function fetch(options: StockHistoryListOptions) {
    const opts = {
      cache: true,
      first: FETCH_OPTIONS.DEFAULT_COUNT,
      ...options,
    };

    store.options = opts;
    store.loading = true;

    try {
      const res = await getStockHistory(opts);
      store.items = res.stockHistory.nodes;
      store.pageInfo = res.stockHistory.pageInfo;
      store.totalCount = res.stockHistory.totalCount;
      store.cursorStack = [];
    } finally {
      store.loading = false;
    }
  }

  /**
   * Fetch the next page of data, if available.
   */
  async function fetchNext() {
    if (store.options === null) throw new Error('[Stock History Store]: fetchNext was run before fetch.');
    const endCursor = store.pageInfo?.endCursor ?? '';
    store.loading = true;

    try {
      const res = await getStockHistory({
        ...store.options,
        after: endCursor,
      });

      store.cursorStack = [...store.cursorStack, endCursor];
      store.items = res.stockHistory.nodes;
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
    if (store.options === null) throw new Error('[Stock History Store]: fetchPrevious was run before fetch.');
    const stack = [...store.cursorStack];
    stack.pop();

    store.loading = true;
    try {
      const res = await getStockHistory({
        ...store.options,
        after: stack[stack.length - 1] ?? null,
      });

      store.cursorStack = stack;
      store.items = res.stockHistory.nodes;
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
    store.options = null;
    store.items = [];
    store.pageInfo = null;
    store.totalCount = 0;
  }

  // When the currently fetched stock updates, refetch history
  const unsubCreate = subscribe(stockUpdate, (stock) => {
    if (store.options === null) return;
    if (store.options.stockId !== stock.id) return;

    fetch({
      ...store.options,
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
    items,
    fetch,
    fetchNext,
    fetchPrevious,
    clear,
    dispose,
  };
}

export type StockHistoryStore = ReturnType<typeof setup>;
