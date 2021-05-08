import { FETCH_OPTIONS } from '@/constants';
import { computed, reactive } from 'vue';
import { getStocks, updateStock, StockListOptions, linkStock, unlinkStock, deleteStock, newStock } from '@/services/stock';
import { create as createEvent, publish, subscribe } from '@/services/eventBus';

const stockCreate = createEvent<Stock>('stock.create');
const stockUpdate = createEvent<Stock>('stock-update');
const stockDelete = createEvent<Stock>('stock-delete');

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
    instances: [] as number[],
    stocks: [] as Stock[],
    selected: null as Stock | null,
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
      first: store.pageCount,
      cache: true,
      ...options,
    };

    store.instances = (opts.instances || false) ? opts.instances : [];
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

  // If a stock object was created elsewhere, push it in
  const unsubCreate = subscribe(stockCreate, (stock) => {
    if (store.instances.length === 0) {
      store.stocks = [...store.stocks, stock];
      return;
    }

    const instanceIds = stock.stockInstances.map((x) => x.instanceId);
    const hasInstance = store.instances.some((x) => instanceIds.includes(x));
    if (hasInstance) { store.stocks = [...store.stocks, stock]; }
  });

  // If a stock object is updated elsewhere, splice it in
  const unsubUpdate = subscribe(stockUpdate, (stock) => {
    const isSelected = store.selected?.id === stock.id ?? false;
    const idx = store.stocks.findIndex((x) => x.id === stock.id);
    if (idx >= 0) {
      const storeInstances = store.stocks[idx].stockInstances.map((x) => x.instanceId);
      const stockInstances = stock.stockInstances.map((x) => x.instanceId);
      const wasUnlinked = !stockInstances.some((x) => storeInstances.includes(x));

      const res = [...store.stocks];
      if (wasUnlinked && store.instances.length > 0) {
        res.splice(idx, 1);
        if (isSelected) { store.selected = null; }
      } else {
        res.splice(idx, 1, stock);
        if (isSelected) { store.selected = stock; }
      }

      store.stocks = res;
    }

    // Push stocks newly linked to the instances being tracked
    if (store.instances.length > 0) {
      const instanceIds = stock.stockInstances.map((x) => x.instanceId);
      const wasLinked = store.instances.some((x) => instanceIds.includes(x));
      if (wasLinked) { store.stocks = [...store.stocks, stock]; }
    }
  });

  // If a stock object is deleted elsewhere, remove it from the list
  const unsubDelete = subscribe(stockDelete, (stock) => {
    store.stocks = store.stocks.filter((x) => x.id !== stock.id);
    if (store.selected?.id === stock.id ?? false) {
      store.selected = null;
    }
  });

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
    stocks,
    selected,
    fetch,
    fetchNext,
    fetchPrevious,
    clear,
    create,
    update,
    link,
    unlink,
    remove,
    dispose,
  };
}

export type ShareStore = ReturnType<typeof setup>;
