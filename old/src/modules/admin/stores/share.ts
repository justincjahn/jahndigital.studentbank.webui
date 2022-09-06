import { computed, reactive, watch } from 'vue';
import { FETCH_OPTIONS } from '@/constants';

// Store
import { StudentStore } from '@/modules/admin/stores/student';

// API
import * as shareService from '@/services/share';
import * as transactionService from '@/services/transaction';

/**
 * Stores information about shares in the system.  Shares are deposit accounts that have
 * transaction histories and a balance.  The Student object receives Share data from the
 * GraphQL api, so we tie the functionality of this store to the studentStore passed in.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function setup(studentStore: StudentStore) {
  const store = reactive({
    loading: false,
    totalCount: 0,
    pageInfo: null as PageInfo|null,
    pageCount: FETCH_OPTIONS.DEFAULT_COUNT,
    cursorStack: [] as string[],
    transactions: [] as Transaction[],
    selected: null as Share|null,
  });

  const loading = computed(() => store.loading);

  const totalCount = computed(() => store.totalCount);

  const selected = computed({
    get: () => store.selected,
    set: (value) => {
      store.selected = value;
    },
  });

  const hasNextPage = computed(() => store.pageInfo?.hasNextPage ?? false);

  const hasPreviousPage = computed(() => store.pageInfo?.hasPreviousPage ?? false);

  const transactions = computed(() => store.transactions);

  const currentFetchCount = computed(() => store.pageCount);

  const totalTransactionPages = computed(() => {
    if (store.totalCount > 0) {
      return Math.ceil(store.totalCount / store.pageCount);
    }

    return 0;
  });

  /**
   * Set the selected share.
   *
   * @param item
   */
  function setSelected(item: Share|null) { store.selected = item; }

  /**
   * Fetch the initial list of transactions
   *
   * @param options
   */
  async function fetchShareTransactions(options: transactionService.TransactionFetchOptions) {
    const opts = {
      cache: false,
      first: store.pageCount,
      ...options,
    };

    store.loading = true;

    try {
      const data = await transactionService.getTransactions(opts);
      store.transactions = data.transactions.nodes;
      store.pageInfo = data.transactions.pageInfo;
      store.totalCount = data.transactions.totalCount;
      store.pageCount = opts.first;
      store.cursorStack = [];
    } finally {
      store.loading = false;
    }
  }

  /**
   * Fetch the next page of transactions
   */
  async function fetchNextTransactions() {
    const { targetShareId } = store.transactions[0] ?? { targetShareId: -1 };
    const endCursor = store.pageInfo?.endCursor ?? '';
    store.loading = true;

    try {
      const data = await transactionService.getTransactions({
        shareId: targetShareId,
        first: store.pageCount,
        after: endCursor,
      });

      store.cursorStack = [...store.cursorStack, endCursor];
      store.transactions = data.transactions.nodes;
      store.pageInfo = data.transactions.pageInfo;
      store.totalCount = data.transactions.totalCount;
    } finally {
      store.loading = false;
    }
  }

  /**
   * Fetch the previous page of transactions
   */
  async function fetchPreviousTransactions() {
    const { targetShareId } = store.transactions[0] ?? { targetShareId: -1 };
    store.loading = true;

    try {
      const stack = [...store.cursorStack];
      stack.pop();

      const data = await transactionService.getTransactions({
        shareId: targetShareId,
        first: store.pageCount,
        after: stack[stack.length - 1] ?? null,
      });

      store.cursorStack = stack;
      store.transactions = data.transactions.nodes;
      store.pageInfo = data.transactions.pageInfo;
      store.totalCount = data.transactions.totalCount;
    } finally {
      store.loading = false;
    }
  }

  /**
   * Clear the transaction list
   */
  async function clearTransactions() {
    store.transactions = [];
    store.pageInfo = null;
    store.totalCount = 0;
  }

  /**
   * Post a new transaction.
   *
   * @param input
   */
  async function postTransaction(input: NewTransactionRequest) {
    const data = await transactionService.newTransaction(input);

    if (store.selected && store.selected.id === input.shareId) {
      const newTransactions = [data.newTransaction, ...store.transactions];
      const maxCount = currentFetchCount.value;

      if (newTransactions.length > maxCount) {
        store.transactions = newTransactions.slice(0, maxCount);
        store.selected = { ...store.selected, balance: data.newTransaction.newBalance };
        return;
      }

      store.transactions = newTransactions;
      store.selected = { ...store.selected, balance: data.newTransaction.newBalance };
    }
  }

  /**
   * Post a bulk transaction
   *
   * @param input
   * @returns A promise containing the list of transactions that were posted.
   */
  async function postBulkTransaction(input: NewBulkTransactionRequest): Promise<Transaction[]> {
    const data = await transactionService.newBulkTransaction(input);
    return data.newBulkTransaction;
  }

  /**
   * Create a new share
   *
   * @param input
   * @returns A promise containing the new share.
   */
  async function newShare(input: NewShareRequest) {
    const data = await shareService.newShare(input);
    return data.newShare[0];
  }

  /**
   * Delete a share
   *
   * @param share
   */
  async function deleteShare(share: Share) {
    const data = await shareService.deleteShare({ id: share.id });

    if (data.deleteShare === true) {
      const isSelected = store.selected?.id === share.id ?? false;
      if (isSelected) { store.selected = null; }
    } else {
      throw new Error('Unable to delete Share: unknown reason.');
    }
  }

  // Watch for selected student changes and select the first share of that student.
  watch(() => studentStore.selected.value, () => {
    if (studentStore.selected.value === null && store.selected !== null) {
      store.selected = null;
    } else if (studentStore.selected.value !== null) {
      const shares = studentStore.selected.value.shares ?? [];
      if (shares.length > 0) [store.selected] = shares;
    }
  }, { immediate: true });

  return {
    studentStore,
    loading,
    totalCount,
    selected,
    hasNextPage,
    hasPreviousPage,
    transactions,
    totalTransactionPages,
    setSelected,
    fetchShareTransactions,
    fetchNextTransactions,
    fetchPreviousTransactions,
    clearTransactions,
    postTransaction,
    postBulkTransaction,
    newShare,
    deleteShare,
  };
}

export type ShareStore = ReturnType<typeof setup>;
