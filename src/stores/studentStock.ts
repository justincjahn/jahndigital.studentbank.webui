import { computed, reactive } from 'vue';
import { FETCH_OPTIONS } from '@/constants';

// Services
import { StudentStocksOptions, getStudentStocks } from '@/services/stock';

/**
 * Stores information about a student's purchased stocks.
 */
export function setup() {
  const store = reactive({
    loading: false,
    totalCount: 0,
    pageInfo: null as PageInfo | null,
    options: null as StudentStocksOptions | null,
    cursorStack: [] as string[],
    items: [] as StudentStock[],
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
  async function fetch(options: StudentStocksOptions) {
    const opts = {
      cache: true,
      first: FETCH_OPTIONS.DEFAULT_COUNT,
      ...options,
    };

    store.options = opts;
    store.loading = true;

    try {
      const res = await getStudentStocks(opts);
      store.items = res.studentStocks.nodes;
      store.pageInfo = res.studentStocks.pageInfo;
      store.totalCount = res.studentStocks.totalCount;
      store.cursorStack = [];
    } finally {
      store.loading = false;
    }
  }

  /**
   * Fetch the next page of data, if available.
   */
  async function fetchNext() {
    if (store.options === null) throw new Error('[Student Stock Store]: fetchNext was run before fetch.');
    const endCursor = store.pageInfo?.endCursor ?? '';
    store.loading = true;

    try {
      const res = await getStudentStocks({
        ...store.options,
        after: endCursor,
      });

      store.cursorStack = [...store.cursorStack, endCursor];
      store.items = res.studentStocks.nodes;
      store.pageInfo = res.studentStocks.pageInfo;
      store.totalCount = res.studentStocks.totalCount;
    } finally {
      store.loading = false;
    }
  }

  /**
   * Fetch the previous page of data, if available.
   */
  async function fetchPrevious() {
    if (store.options === null) throw new Error('[Student Stock Store]: fetchPrevious was run before fetch.');
    const stack = [...store.cursorStack];
    stack.pop();

    store.loading = true;
    try {
      const res = await getStudentStocks({
        ...store.options,
        after: stack[stack.length - 1] ?? null,
      });

      store.cursorStack = stack;
      store.items = res.studentStocks.nodes;
      store.pageInfo = res.studentStocks.pageInfo;
      store.totalCount = res.studentStocks.totalCount;
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

  /**
   * Unsubscribe from events.
   */
  function dispose() { /* NOT IMPLEMENTED */ }

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

export type StudentStockStore = ReturnType<typeof setup>;
