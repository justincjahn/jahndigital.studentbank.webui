import {
  Module,
  VuexModule,
  Mutation,
  getModule,
  MutationAction,
} from 'vuex-module-decorators';
import store from '@/store';
import Apollo from '@/services/Apollo';
import gqlTransactions from '@/graphql/transactions.query.gql';
import gqlNewTransaction from '@/graphql/newTransaction.mutation.gql';
import { FETCH_OPTIONS } from '@/constants';

type FetchOptions = {
  shareId: number;
  first?: number;
}

/**
 * Share and share transaction information.
 */
@Module({ dynamic: true, store, name: 'share' })
class ShareState extends VuexModule implements State.IShareState {
  totalCount = 0;

  pageInfo: PageInfo|null = null;

  selectedShare: Share|null = null;

  transactionPageCount = FETCH_OPTIONS.DEFAULT_COUNT;

  transactionCursorStack: string[] = [];

  transactionCurrentPage = 0;

  transactions: Transaction[] = [];

  loading = false;

  /**
   * Fetch share transactions from the GraphQL API.
   *
   * @param fetchOptions Options for the fetch.
   */
  @MutationAction
  async fetchShareTransactions(options: FetchOptions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const self = this as Record<string, any>;
    self.commit('setShareLoading', true);

    const pageCount = options.first ?? self.getters.currentTransactionFetchCount;
    try {
      const res = await Apollo.query<PagedTransactionResponse>({
        query: gqlTransactions,
        variables: {
          shareId: options.shareId,
          first: pageCount,
        },
      });

      if (res.data) {
        return {
          transactions: res.data.transactions.nodes,
          pageInfo: res.data.transactions.pageInfo,
          totalCount: res.data.transactions.totalCount,
          transactionPageCount: pageCount,
          transactionCursorStack: [] as string[],
        };
      }
    } catch (e) {
      throw e?.message ?? e;
    } finally {
      self.commit('setShareLoading', false);
    }

    return {
      transactions: [],
      pageInfo: null,
      totalCount: 0,
      transactionPageCount: pageCount,
      transactionCursorStack: [] as string[],
    };
  }

  /**
   * Fetch the next page of transactions from the GraphQL API.
   */
  @MutationAction
  async fetchNextTransactions() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const self = this as Record<string, any>;
    self.commit('setShareLoading', true);

    const { targetShareId } = self.state.transactions[0] ?? { targetShareId: -1 };
    const { endCursor } = self.state.pageInfo;

    console.log(self.state.pageInfo.endCursor);

    try {
      const res = await Apollo.query<PagedTransactionResponse>({
        query: gqlTransactions,
        variables: {
          shareId: targetShareId,
          first: self.getters.currentTransactionFetchCount,
          after: endCursor,
        },
      });

      if (res.data) {
        // Add the current end cursor to the stack before we overwrite it
        const transactionCursorStack = [
          ...self.state.transactionCursorStack,
          endCursor,
        ];

        return {
          transactions: res.data.transactions.nodes,
          pageInfo: res.data.transactions.pageInfo,
          totalCount: res.data.transactions.totalCount,
          transactionCursorStack,
        };
      }
    } catch (e) {
      throw e?.message ?? e;
    } finally {
      self.commit('setShareLoading', false);
    }

    return {};
  }

  /**
   * Fetch the previous page of transactions from the GraphQL API.
   */
  @MutationAction
  async fetchPreviousTransactions() {
    const self = this as Record<string, any>;
    self.commit('setShareLoading', true);

    const { targetShareId } = self.state.transactions[0] ?? { targetShareId: -1 };

    try {
      const stack = [...self.state.transactionCursorStack];
      stack.pop();

      const res = await Apollo.query<PagedTransactionResponse>({
        query: gqlTransactions,
        variables: {
          shareId: targetShareId,
          first: self.getters.currentTransactionFetchCount,
          after: stack[stack.length - 1] ?? null,
        },
      });

      if (res.data) {
        return {
          transactions: res.data.transactions.nodes,
          pageInfo: res.data.transactions.pageInfo,
          totalCount: res.data.transactions.totalCount,
          transactionCursorStack: stack,
        };
      }
    } catch (e) {
      throw e?.message ?? e;
    } finally {
      self.commit('setShareLoading', false);
    }

    return {};
  }

  /**
   * Clear the list of students.
   */
  @MutationAction
  // eslint-disable-next-line class-methods-use-this
  async clearTransactions() {
    return {
      transactions: [] as Transaction[],
      pageInfo: null as PageInfo|null,
      totalCount: 0,
    };
  }

  /**
   * Attempt to post a transaction.
   *
   * @param input The input to send to the GraphQL server.
   */
  @MutationAction
  async postTransaction(input: NewTransactionRequest) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const self = this as Record<string, any>;

    try {
      const res = await Apollo.mutate<NewTransactionResponse>({
        mutation: gqlNewTransaction,
        variables: input,
      });

      if (res.data) {
        if (self.state.selectedShare && self.state.selectedShare.id === input.shareId) {
          await Apollo.clearStore();

          const transactions = [res.data.newTransaction, ...self.state.transactions];
          const maxCount = self.state.transactionPageCount ?? FETCH_OPTIONS.DEFAULT_COUNT;

          if (transactions.length > maxCount) {
            return {
              transactions: transactions.slice(0, maxCount),
              selectedShare: {
                ...self.state.selectedShare,
                balance: res.data.newTransaction.newBalance,
              },
            };
          }

          return {
            transactions,
            selectedShare: {
              ...self.state.selectedShare,
              balance: res.data.newTransaction.newBalance,
            },
          };
        }
      }
    } catch (e) {
      throw e?.message ?? e;
    }

    return {};
  }

  /**
   * Set the loading state to the value provided.
   *
   * @param loading The loading state.
   */
  @Mutation
  setShareLoading(loading: boolean) {
    this.loading = loading;
  }

  /**
   * Set the selected share.
   *
   * @param share The share to set as selected.
   */
  @Mutation
  setSelectedShare(share: Share|null) {
    this.selectedShare = share;
  }

  /**
   * Get the total number of pages.
   */
  get totalTransactionPages() {
    if (this.totalCount > 0) {
      return Math.ceil(this.totalCount / this.currentTransactionFetchCount);
    }

    return 0;
  }

  /**
   * Get the current number of transactions to fetch.
   */
  get currentTransactionFetchCount() {
    return this.transactionPageCount ?? FETCH_OPTIONS.DEFAULT_COUNT;
  }
}

const ShareModule = getModule(ShareState);
export default ShareModule;
