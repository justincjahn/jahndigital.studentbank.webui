import { computed, reactive } from 'vue';
import { FETCH_OPTIONS } from '@/common/constants';
import type { PageInfo } from '@/generated/graphql';

/**
 * Represents the information the usePagination composable requires
 * from a fetch function when returning.
 */
export interface FetchReturn {
  pageInfo: PageInfo | null;
  totalCount: number;
}

/**
 * The options required to setup pagination.
 */
export interface SetupOptions<TFetchParams> {
  /**
   * Performs an initial fetch.  Can accept options.
   */
  fetch: (options: TFetchParams, size: number) => Promise<FetchReturn>;

  /**
   * Performs a fetch of the next page.
   */
  fetchNext: (cursor: string, size: number) => Promise<FetchReturn>;

  /**
   * Performs a fetch of the previous page.
   */
  fetchPrevious: (cursor: string, size: number) => Promise<FetchReturn>;

  /**
   * The number of items that should be fetched.
   */
  pageSize?: number;
}

export default function setup<TFetchParams>(
  options: SetupOptions<TFetchParams>
) {
  // Used to refetch data if the page size changes
  let lastFetchOptions: TFetchParams | null = null;

  const store = reactive({
    totalCount: 0,
    pageInfo: null as PageInfo | null,
    pageSize: -1,
    cursorStack: [] as string[],
  });

  store.pageSize = options.pageSize ?? FETCH_OPTIONS.DEFAULT_COUNT;

  /**
   * Reset the store.
   */
  function clear() {
    store.pageInfo = null;
    store.totalCount = 0;
    store.cursorStack = [];
  }

  // The total number of items found on the backend
  const totalCount = computed(() => store.totalCount);

  // True if there is another page to fetch
  const hasNextPage = computed(() => store.pageInfo?.hasNextPage ?? false);

  // True if there is a previous page to fetch
  const hasPreviousPage = computed(
    () => store.pageInfo?.hasPreviousPage ?? false
  );

  /**
   * Perform an initial fetch of data.
   *
   * @param opts
   */
  async function fetch(opts: TFetchParams) {
    clear();
    lastFetchOptions = opts;
    const info = await options.fetch(opts, store.pageSize);
    store.pageInfo = info.pageInfo;
    store.totalCount = info.totalCount;
  }

  // The total number of items to fetch
  const pageSize = computed({
    get() {
      return store.pageSize;
    },

    set(val) {
      if (store.pageSize === val) return;

      store.pageSize = val;

      if (lastFetchOptions !== null) {
        options.fetch(lastFetchOptions, store.pageSize);
      }
    },
  });

  // The total number of pages at the current page size
  const totalPages = computed(() => {
    if (store.totalCount > 0) {
      return Math.ceil(store.totalCount / pageSize.value);
    }

    return 0;
  });

  /**
   * Fetch the next page of data, if available.
   */
  async function fetchNext() {
    if (!hasNextPage.value) return;

    const endCursor = store.pageInfo?.endCursor ?? '';
    const info = await options.fetchNext(endCursor, pageSize.value);
    store.cursorStack = [...store.cursorStack, store.pageInfo?.endCursor ?? ''];
    store.pageInfo = info.pageInfo;
    store.totalCount = info.totalCount;
  }

  /**
   * Fetch the previous page of data if available.
   */
  async function fetchPrevious() {
    if (!hasPreviousPage.value) return;

    const stack = [...store.cursorStack];
    stack.pop();
    const info = await options.fetchPrevious(
      stack[stack.length - 1],
      pageSize.value
    );
    store.cursorStack = stack;
    store.pageInfo = info.pageInfo;
    store.totalCount = info.totalCount;
  }

  return {
    totalCount,
    hasNextPage,
    hasPreviousPage,
    pageSize,
    totalPages,
    clear,
    fetch,
    fetchNext,
    fetchPrevious,
  };
}

export type UsePagination = ReturnType<typeof setup>;
