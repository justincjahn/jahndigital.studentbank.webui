import { FETCH_OPTIONS } from '@/constants';
import { computed, reactive } from 'vue';
import { getStocks } from '@/services/stock';

interface FetchOptions {
  first?: number;
}

/**
 * Stores information about stocks in the system and enables pagination.
 */
export function setup() {
  const store = reactive({
    loading: false,
    totalCount: 0,
    pageInfo: null as PageInfo | null,
    pageCount: FETCH_OPTIONS.DEFAULT_COUNT,
    cursorStack: [] as string[],
    stocks: [] as Stock[],
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

  const stocks = computed(() => store.stocks);

  /**
   * Perform an initial fetch of data with the provided options.
   *
   * @param options
   */
  async function fetch(options?: FetchOptions) {
    const opts = {
      first: store.pageCount,
      ...options,
    };

    store.loading = true;

    try {
      const res = await getStocks(opts);
      store.stocks = res.stocks.nodes;
      store.pageInfo = res.stocks.pageInfo;
      store.totalCount = res.stocks.totalCount;
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
    const endCursor = store.pageInfo?.endCursor ?? '';
    store.loading = true;

    try {
      const res = await getStocks({
        first: store.pageCount,
        after: endCursor,
      });

      store.cursorStack = [...store.cursorStack, endCursor];
      store.stocks = res.stocks.nodes;
      store.pageInfo = res.stocks.pageInfo;
      store.totalCount = res.stocks.totalCount;
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
      const res = await getStocks({
        first: store.pageCount,
        after: stack[stack.length - 1] ?? null,
      });

      store.cursorStack = stack;
      store.stocks = res.stocks.nodes;
      store.pageInfo = res.stocks.pageInfo;
      store.totalCount = res.stocks.totalCount;
    } finally {
      store.loading = false;
    }
  }

  /**
   * Clear the data in this store.
   */
  function clear() {
    store.stocks = [];
    store.pageInfo = null;
    store.totalCount = 0;
  }

  return {
    loading,
    pageCount,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    totalPages,
    stocks,
    fetch,
    fetchNext,
    fetchPrevious,
    clear,
  };
}

export type ShareStore = ReturnType<typeof setup>;
