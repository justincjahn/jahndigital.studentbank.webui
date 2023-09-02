import { computed, reactive, watch } from 'vue';

// Types
import type { Stock } from '@/common/services/stock';
import type { InstanceStore } from '@/admin/common/stores/instance';

// Composables
import usePagination from '@/common/composables/usePagination';

// GraphQL
import {
  getStocks,
  newStock,
  updateStock,
  linkStock,
  unlinkStock,
  deleteStock,
} from '@/common/services/stock';

/**
 * Stores information about stocks in the system.
 *
 * @param instanceStore The {InstanceStore} to watch, if desired.
 */
export function setup(instanceStore?: InstanceStore) {
  const store = reactive({
    loading: false,
    instances: [] as number[],
    stocks: [] as Stock[],
    selected: null as Stock | null,
  });

  // True if the store is loading data
  const loading = computed(() => store.loading);

  // Get a list of fetched stocks
  const stocks = computed(() => store.stocks);

  // Get or set the selected stock
  const selected = computed({
    get: () => store.selected,
    set(value) {
      store.selected = value;
    },
  });

  const {
    totalCount,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    fetch,
    fetchNext,
    fetchPrevious,
  } = usePagination<Parameters<typeof getStocks>[0]>({
    async fetch(options, size) {
      const opts = {
        first: size,
        cache: true,
        instances: instanceStore
          ? [instanceStore.selected.value?.id ?? -1]
          : undefined,
        ...options,
      };

      if (opts.instances) {
        if (Array.isArray(opts.instances)) {
          store.instances = opts.instances;
        } else {
          store.instances = [opts.instances];
        }
      }

      store.loading = true;

      try {
        const data = await getStocks(opts);

        if (!data.stocks) {
          throw new Error('No data returned');
        }

        store.stocks = data.stocks.nodes ?? [];

        return {
          pageInfo: data.stocks.pageInfo,
          totalCount: data.stocks.totalCount,
        };
      } finally {
        store.loading = false;
      }
    },

    async fetchNext(cursor, size) {
      store.loading = true;

      try {
        const data = await getStocks({
          instances: store.instances.length > 0 ? store.instances : undefined,
          first: size,
          after: cursor,
        });

        if (!data.stocks) {
          throw new Error('No data returned');
        }

        store.stocks = data.stocks.nodes ?? [];

        return {
          pageInfo: data.stocks.pageInfo,
          totalCount: data.stocks.totalCount,
        };
      } finally {
        store.loading = false;
      }
    },

    async fetchPrevious(cursor, size) {
      store.loading = true;

      try {
        const data = await getStocks({
          instances: store.instances.length > 0 ? store.instances : undefined,
          first: size,
          after: cursor,
        });

        if (!data.stocks) {
          throw new Error('No data returned');
        }

        store.stocks = data.stocks.nodes ?? [];

        return {
          pageInfo: data.stocks.pageInfo,
          totalCount: data.stocks.totalCount,
        };
      } finally {
        store.loading = false;
      }
    },
  });

  function sort(arr: Stock[]) {
    // eslint-disable-next-line no-nested-ternary
    arr.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }

  /**
   * Create a new stock and add it to the store if it's in the same instances as
   * the one selected.
   *
   * @param input
   */
  async function create(input: Parameters<typeof newStock>[0]) {
    const data = await newStock(input);
    const [stock] = data.newStock;

    const instanceId = instanceStore?.selected.value?.id ?? -1;
    const hasInstance = stock.stockInstances.findIndex(
      (x) => x.instanceId === instanceId
    );

    if (
      (store.instances.length > 0 && hasInstance >= 0) ||
      store.instances.length <= 0
    ) {
      const newStocks = [...store.stocks, stock];
      sort(newStocks);
      store.stocks = newStocks;
    }
  }

  /**
   * Update a stock and update the instance if it's in the same instance as
   * the one selected.
   *
   * @param input
   */
  async function update(input: Parameters<typeof updateStock>[0]) {
    const data = await updateStock(input);
    const [stock] = data.updateStock;
    const isListed = store.stocks.findIndex((x) => x.id === input.id);

    if (isListed >= 0) {
      const newStocks = [...store.stocks];
      newStocks[isListed] = stock;
      sort(newStocks);
      store.stocks = newStocks;

      if (store.selected && store.selected.id === input.id) {
        store.selected = stock;
      }
    }
  }

  /**
   * Link a stock to an instance.
   *
   * @param input
   */
  async function link(input: Parameters<typeof linkStock>[0]) {
    const data = await linkStock(input);
    const isListed = store.stocks.findIndex((x) => x.id === input.stockId);

    if (isListed >= 0) {
      const newStocks = [...store.stocks];
      [newStocks[isListed]] = data.linkStock;
      sort(newStocks);
      store.stocks = newStocks;
    } else if (store.instances.includes(input.instanceId)) {
      const newStocks = [...store.stocks, ...data.linkStock];
      sort(newStocks);
      store.stocks = newStocks;
    }

    if (store.selected && store.selected.id === input.stockId) {
      [store.selected] = data.linkStock;
    }
  }

  /**
   * Unlink a stock from an instance.
   *
   * @param input
   */
  async function unlink(input: Parameters<typeof unlinkStock>[0]) {
    const data = await unlinkStock(input);
    const isListed = store.stocks.findIndex((x) => x.id === input.stockId);

    if (store.instances.includes(input.instanceId)) {
      const newStocks = [
        ...store.stocks.filter((x) => x.id !== data.unlinkStock[0].id),
      ];

      store.stocks = newStocks;
    } else if (isListed >= 0) {
      const newStocks = [...store.stocks];
      [newStocks[isListed]] = data.unlinkStock;
      store.stocks = newStocks;
    }

    if (store.selected && store.selected.id === input.stockId) {
      store.selected = null;
    }
  }

  /**
   * Delete a stock.
   *
   * @param stock
   */
  async function remove(stock: Stock) {
    const data = await deleteStock(stock);

    if (!data.deleteStock) {
      throw new Error('Unable to delete Stock: Unknown reason.');
    }

    const isListed = store.stocks.findIndex((x) => x.id === stock.id);

    if (isListed >= 0) {
      store.stocks = store.stocks.filter((x) => x.id !== stock.id);
    }

    if (store.selected && store.selected.id === stock.id) {
      store.selected = null;
    }
  }

  watch(
    () => instanceStore?.selected.value,
    (newValue, oldValue) => {
      if (!newValue) {
        store.stocks = [];
      } else if (newValue.id !== oldValue?.id) {
        fetch({});
      }
    }
  );

  return {
    // State
    loading,
    stocks,
    selected,

    // Pagination
    totalCount,
    totalPages,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    fetch,
    fetchNext,
    fetchPrevious,

    // CRUD
    create,
    update,
    link,
    unlink,
    remove,
  };
}

export type StockStore = ReturnType<typeof setup>;
