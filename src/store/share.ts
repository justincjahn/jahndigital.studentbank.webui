import Apollo from '@/services/Apollo';
import gqlTransactions from '@/graphql/transactions.query.gql';
import gqlNewTransaction from '@/graphql/newTransaction.mutation.gql';
import { FETCH_OPTIONS } from '@/constants';
import { computed, reactive, watch } from 'vue';
import theStudentStore, { StudentStore } from './student';

type FetchOptions = {
  shareId: number;
  first?: number;
}

/**
 * Stores information about shares in the system.  Shares are deposit accounts that have
 * transaction histories and a balance.  The Student object receives Share data from the
 * GraphQL api, so we tie the functionality of this store to the studentStore passed in.
 */
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

  // GETs the loading state of the fetch operation
  const loading = computed(() => store.loading);

  // GETs the total number of shares
  const totalCount = computed(() => store.totalCount);

  // GETs the selected share
  const selected = computed(() => store.selected);

  // GETs the PageInfo property
  const pageInfo = computed(() => store.pageInfo);

  // GETs the current list of transactions
  const transactions = computed(() => store.transactions);

  // GETS the current number of items to fetch per operation
  const currentFetchCount = computed(
    () => store.pageCount ?? FETCH_OPTIONS.DEFAULT_COUNT,
  );

  // GETs the total number of pages for transaction
  const totalTransactionPages = computed(() => {
    if (store.totalCount > 0) {
      return Math.ceil(store.totalCount / currentFetchCount.value);
    }

    return 0;
  });

  // SETs the selected share
  function setSelected(item: Share|null) { store.selected = item; }

  // Fetch the initial list of transactions
  async function fetchShareTransactions(options: FetchOptions) {
    const pageCount = options?.first ?? currentFetchCount.value;
    store.loading = true;

    try {
      const res = await Apollo.query<PagedTransactionResponse>({
        query: gqlTransactions,
        variables: {
          shareId: options.shareId,
          first: pageCount,
        },
      });

      if (res.data) {
        store.transactions = res.data.transactions.nodes;
        store.pageInfo = res.data.transactions.pageInfo;
        store.totalCount = res.data.transactions.totalCount;
        store.pageCount = options?.first ?? store.pageCount;
        store.cursorStack = [];
      }
    } catch (e) {
      throw e?.message ?? e;
    } finally {
      store.loading = false;
    }
  }

  // Fetch the next page of transactions
  async function fetchNextTransactions() {
    const { targetShareId } = store.transactions[0] ?? { targetShareId: -1 };
    const endCursor = store.pageInfo?.endCursor ?? '';
    store.loading = true;

    try {
      const res = await Apollo.query<PagedTransactionResponse>({
        query: gqlTransactions,
        variables: {
          shareId: targetShareId,
          first: currentFetchCount.value,
          after: endCursor,
        },
      });

      if (res.data) {
        // Add the current end cursor to the stack before we overwrite it
        store.cursorStack = [...store.cursorStack, endCursor];
        store.transactions = res.data.transactions.nodes;
        store.pageInfo = res.data.transactions.pageInfo;
        store.totalCount = res.data.transactions.totalCount;
      }
    } catch (e) {
      throw e?.message ?? e;
    } finally {
      store.loading = false;
    }
  }

  // Fetch the previous page of transactions
  async function fetchPreviousTransactions() {
    const { targetShareId } = store.transactions[0] ?? { targetShareId: -1 };
    store.loading = true;

    try {
      const stack = [...store.cursorStack];
      stack.pop();

      const res = await Apollo.query<PagedTransactionResponse>({
        query: gqlTransactions,
        variables: {
          shareId: targetShareId,
          first: currentFetchCount.value,
          after: stack[stack.length - 1] ?? null,
        },
      });

      if (res.data) {
        store.cursorStack = stack;
        store.transactions = res.data.transactions.nodes;
        store.pageInfo = res.data.transactions.pageInfo;
        store.totalCount = res.data.transactions.totalCount;
      }
    } catch (e) {
      throw e?.message ?? e;
    } finally {
      store.loading = false;
    }
  }

  // Clear the transaction list
  async function clearTransactions() {
    store.transactions = [];
    store.pageInfo = null;
    store.totalCount = 0;
  }

  // Post a transaction
  async function postTransaction(input: NewTransactionRequest) {
    try {
      const res = await Apollo.mutate<NewTransactionResponse>({
        mutation: gqlNewTransaction,
        variables: input,
      });

      if (res.data) {
        if (store.selected && store.selected.id === input.shareId) {
          await Apollo.clearStore();

          const newTransactions = [res.data.newTransaction, ...store.transactions];
          const maxCount = currentFetchCount.value;

          if (newTransactions.length > maxCount) {
            store.transactions = newTransactions.slice(0, maxCount);
            store.selected = { ...store.selected, balance: res.data.newTransaction.newBalance };
            return;
          }

          store.transactions = newTransactions;
          store.selected = { ...store.selected, balance: res.data.newTransaction.newBalance };
        }
      }
    } catch (e) {
      throw e?.message ?? e;
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
  });

  return {
    studentStore,
    loading,
    totalCount,
    selected,
    pageInfo,
    transactions,
    totalTransactionPages,
    setSelected,
    fetchShareTransactions,
    fetchNextTransactions,
    fetchPreviousTransactions,
    clearTransactions,
    postTransaction,
  };
}

const store = setup(theStudentStore);
export type ShareStore = ReturnType<typeof setup>;
export default store;
