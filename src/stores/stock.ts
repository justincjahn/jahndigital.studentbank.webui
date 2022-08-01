import { computed, reactive } from 'vue';
import { FETCH_OPTIONS } from '@/constants';

// Services
import {
  StockListOptions,
  getStocks,
  updateStock,
  linkStock,
  unlinkStock,
  deleteStock,
  newStock,
  purgeStockHistory,
} from '@/services/stock';

// Events
import { publish, subscribe } from '@/services/eventBus';
import { stockCreate, stockUpdate, stockDelete } from '@/events';

/**
 * Stores information about stocks in the system and enables pagination.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function setup() {
  const store = reactive({
    loading: false,
    totalCount: 0,
    pageInfo: null as PageInfo | null,
    options: null as StockListOptions|null,
    cursorStack: [] as string[],
    instances: [] as number[],
    items: [] as Stock[],
    selected: null as Stock | null,
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

  const selected = computed({
    get: () => store.selected,
    set: (value) => { store.selected = value; },
  });

  /**
   * Perform an initial fetch of data with the provided options.
   *
   * @param options
   */
  async function fetch(options?: StockListOptions) {
    const opts = {
      instances: undefined,
      cache: true,
      first: FETCH_OPTIONS.DEFAULT_COUNT,
      ...options,
    };

    store.instances = (opts.instances || false) ? opts.instances : [];
    store.options = opts;
    store.loading = true;

    try {
      const res = await getStocks(opts);
      store.items = res.stocks.nodes;
      store.pageInfo = res.stocks.pageInfo;
      store.totalCount = res.stocks.totalCount;
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
        ...store.options,
        after: endCursor,
      });

      store.cursorStack = [...store.cursorStack, endCursor];
      store.items = res.stocks.nodes;
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
        ...store.options,
        after: stack[stack.length - 1] ?? null,
      });

      store.cursorStack = stack;
      store.items = res.stocks.nodes;
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
    store.items = [];
    store.pageInfo = null;
    store.totalCount = 0;
    store.options = null;
  }

  /**
   * Create a stock and return it.
   *
   * @param input
   * @returns
   */
  async function create(input: NewStockRequest) {
    const res = await newStock(input);

    if (res.newStock[0]) {
      publish(stockCreate, res.newStock[0]);
      return res.newStock[0];
    }

    throw new Error('[Create Stock]: Stock object was not returned by the server!');
  }

  /**
   * Update a stock and return it.
   *
   * @param input
   */
  async function update(input: UpdateStockRequest) {
    const res = await updateStock(input);

    if (res.updateStock[0]) {
      publish(stockUpdate, res.updateStock[0]);
      return res.updateStock[0];
    }

    throw new Error('[Update Stock]: Stock object was not returned by the server!');
  }

  /**
   * Links a stock to an instance and return it.
   *
   * @param input
   * @returns
   */
  async function link(input: LinkUnlinkStockRequest) {
    const res = await linkStock(input);

    if (res.linkStock[0]) {
      publish(stockUpdate, res.linkStock[0]);
      return res.linkStock[0];
    }

    throw new Error('[Link Stock]: Stock object was not returned by the server!');
  }

  /**
   * Unlinks a stock from an instance and returns it.
   *
   * @param input
   * @returns
   */
  async function unlink(input: LinkUnlinkStockRequest) {
    const res = await unlinkStock(input);

    if (res.unlinkStock[0]) {
      publish(stockUpdate, res.unlinkStock[0]);
      return res.unlinkStock[0];
    }

    throw new Error('[Unlink Stock]: Stock object was not returned by the server!');
  }

  /**
   * Removes a stock from the database.
   *
   * @param stock
   * @returns
   */
  async function remove(stock: Stock) {
    const res = await deleteStock(stock);

    if (res.deleteStock) {
      publish(stockDelete, stock);
      return;
    }

    throw new Error('[Remove Stock]: Stock was not deleted from the server!');
  }

  /**
   * Purges history of a stock to a given point.
   *
   * @param stock The stock whose history to purge.
   * @param date A date in yyyy-mm-dd format.
   * @returns A list of {@link StockHistory} objects that were purged.
   */
  async function purgeHistory(stock: Stock, date: string) {
    const res = await purgeStockHistory({
      stockId: stock.id,
      date,
    });

    if (res.purgeStockHistory) {
      publish(stockUpdate, stock);
      return res.purgeStockHistory;
    }

    throw new Error('[Purge Stock History]: Stock History was not deleted from the server!');
  }

  // If a stock object was created elsewhere, push it in
  const unsubCreate = subscribe(stockCreate, (stock) => {
    if (store.instances.length === 0) {
      store.items = [...store.items, stock];
      return;
    }

    const instanceIds = (stock?.stockInstances ?? []).map((x) => x.instanceId);
    const hasInstance = store.instances.some((x) => instanceIds.includes(x));
    if (hasInstance) { store.items = [...store.items, stock]; }
  });

  // If a stock object is updated elsewhere, splice it in
  const unsubUpdate = subscribe(stockUpdate, (stock) => {
    const isSelected = store.selected?.id === stock.id ?? false;
    const idx = store.items.findIndex((x) => x.id === stock.id);
    if (idx >= 0) {
      const storeInstances = (store.items[idx]?.stockInstances ?? []).map((x) => x.instanceId);
      const stockInstances = (stock?.stockInstances ?? []).map((x) => x.instanceId);
      const wasUnlinked = !storeInstances.every((x) => stockInstances.includes(x));

      const newStocks = store.items.filter((x) => x.id !== stock.id);
      if (wasUnlinked && store.instances.length > 0) {
        if (isSelected) { store.selected = null; }
      } else {
        newStocks.push(stock);
        if (isSelected) { store.selected = stock; }
      }

      store.items = newStocks;
    } else if (store.instances.length > 0) {
      const instanceIds = (stock?.stockInstances ?? []).map((x) => x.instanceId);
      const wasLinked = store.instances.some((x) => instanceIds.includes(x));
      if (wasLinked) { store.items = [...store.items, stock]; }
    }
  });

  // If a stock object is deleted elsewhere, remove it from the list
  const unsubDelete = subscribe(stockDelete, (stock) => {
    store.items = store.items.filter((x) => x.id !== stock.id);
    if (store.selected?.id === stock.id ?? false) {
      store.selected = null;
    }
  });

  /**
   * Fetch a specific stock by ID and return it.
   *
   * @param id The ID number of the student.
   * @returns {Stock|null} A Stock object, or null if no student was found.
   * @throws {Error} If an error ocurred during the fetch operation.
   */
  async function getById(id: number): Promise<Stock | null> {
    const data = await getStocks({
      where: { id: { eq: id } },
      first: 1,
    });

    if (data.stocks.nodes.length > 0) {
      return data.stocks.nodes[0];
    }

    return null;
  }

  /**
   * Unsubscribe from global events in preparation for the store unmounting
   */
  function dispose() {
    unsubCreate();
    unsubUpdate();
    unsubDelete();
  }

  return {
    loading,
    pageCount,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    totalPages,
    items,
    selected,
    fetch,
    fetchNext,
    fetchPrevious,
    getById,
    clear,
    create,
    update,
    link,
    unlink,
    remove,
    purgeHistory,
    dispose,
  };
}

export type StockStore = ReturnType<typeof setup>;
