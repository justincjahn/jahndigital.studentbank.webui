import { computed, reactive, watch } from 'vue';
import { FETCH_OPTIONS } from '@/constants';

// Stores
import { InstanceStore } from '@/modules/admin/stores/instance';

// GraphQL
import Apollo from '@/services/Apollo';
import gqlAvailableShareTypes from '@/modules/admin/graphql/queries/shareTypesAvailable.gql';
import gqlShareTypesByInstance from '@/modules/admin/graphql/queries/shareTypesByInstance.gql';
import gqlNewShareType from '@/modules/admin/graphql/mutations/shareTypeCreate.gql';
import gqlUpdateShareType from '@/modules/admin/graphql/mutations/shareTypeUpdate.gql';
import gqlLinkShareType from '@/modules/admin/graphql/mutations/shareTypeLink.gql';
import gqlUnlinkShareType from '@/modules/admin/graphql/mutations/shareTypeUnlink.gql';
import gqlDeleteShareType from '@/modules/admin/graphql/mutations/shareTypeDelete.gql';

/**
 * Options used on the initial fetch.
 */
type FetchOptions = {
  available?: boolean;
  first?: number;
  cache?: boolean;
}

/**
 * Stores information about share types in the system.
 *
 * When the provided InstanceStore's currently selected Instance changes, the store will
 * automatically fetch Share Types for the new instance if it changes and fetch wasn't already
 * called with {FetchOptions.available}.
 *
 * @param {InstanceStore} instanceStore The InstanceStore to watch.
 * @param {boolean} immediate If the store should immediatley try to fetch share types instead of waiting for change.
 */
export function setup(instanceStore: InstanceStore, immediate = true) {
  const store = reactive({
    loading: false,
    byInstance: true,
    query: gqlShareTypesByInstance,
    totalCount: 0,
    pageInfo: null as PageInfo|null,
    pageCount: FETCH_OPTIONS.DEFAULT_COUNT,
    cursorStack: [] as string[],
    shareTypes: [] as ShareType[],
  });

  // GETs the loading state of the fetch operation
  const loading = computed(() => store.loading);

  // GETs the total number of shares
  const totalCount = computed(() => store.totalCount);

  // GETs the PageInfo property
  const pageInfo = computed(() => store.pageInfo);

  // GETs the current list of transactions
  const shareTypes = computed(() => store.shareTypes);

  // GETS the current number of items to fetch per operation
  const currentFetchCount = computed(() => store.pageCount ?? FETCH_OPTIONS.DEFAULT_COUNT);

  // GETs the total number of pages for transaction
  const totalTransactionPages = computed(() => {
    if (store.totalCount > 0) {
      return Math.ceil(store.totalCount / currentFetchCount.value);
    }

    return 0;
  });

  /**
   * Update the store with the response from the server.
   *
   * @param res
   */
  function set(res: PagedShareTypeResponse) {
    if (res.shareTypes) {
      store.shareTypes = res.shareTypes.nodes;
      store.pageInfo = res.shareTypes.pageInfo;
      store.totalCount = res.shareTypes.totalCount;
    } else if (res.availableShareTypes) {
      store.shareTypes = res.availableShareTypes.nodes;
      store.pageInfo = res.availableShareTypes.pageInfo;
      store.totalCount = res.availableShareTypes.totalCount;
    }
  }

  /**
   * Fetch the initial list of shareTypes.
   *
   * @param {FetchOptions=} options
   */
  async function fetch(options?: FetchOptions) {
    const pageCount = options?.first ?? currentFetchCount.value;
    store.loading = true;

    // Switch the query to available if that's what was requested
    if (options?.available ?? false) {
      store.query = gqlAvailableShareTypes;
      store.byInstance = false;
    }

    const variables = {
      instanceId: instanceStore.selected.value?.id ?? -1,
      first: pageCount,
    };

    try {
      const res = await Apollo.query<PagedShareTypeResponse>({
        query: store.query,
        variables,
        fetchPolicy: ((options?.cache ?? true) === false) ? 'network-only' : 'cache-first',
      });

      if (res.data) {
        set(res.data);
        store.pageCount = options?.first ?? store.pageCount;
        store.cursorStack = [];
      }
    } catch (e) {
      throw e?.message ?? e;
    } finally {
      store.loading = false;
    }
  }

  /**
   * Fetch the next page of shareTypes.
   */
  async function fetchNext() {
    store.loading = true;
    const endCursor = store.pageInfo?.endCursor ?? '';

    const variables = {
      instanceId: instanceStore.selected.value?.id ?? -1,
      first: currentFetchCount.value,
      after: endCursor,
    };

    try {
      const res = await Apollo.query<PagedShareTypeResponse>({
        query: store.query,
        variables,
      });

      if (res.data) {
        // Add the current end cursor to the stack before we overwrite it
        store.cursorStack = [...store.cursorStack, endCursor];
        set(res.data);
      }
    } catch (e) {
      throw e?.message ?? e;
    } finally {
      store.loading = false;
    }
  }

  /**
   * Fetch the previous page of shareTypes.
   */
  async function fetchPrevious() {
    store.loading = true;

    const stack = [...store.cursorStack];
    stack.pop();

    const variables = {
      instanceId: instanceStore.selected.value?.id ?? -1,
      first: currentFetchCount.value,
      after: stack[stack.length - 1] ?? null,
    };

    try {
      const res = await Apollo.query<PagedShareTypeResponse>({
        query: store.query,
        variables,
      });

      if (res.data) {
        store.cursorStack = stack;
        set(res.data);
      }
    } catch (e) {
      throw e?.message ?? e;
    } finally {
      store.loading = false;
    }
  }

  /**
   * Create a new share type.
   *
   * @param {NewShareTypeRequest} input
   */
  async function newShareType(input: NewShareTypeRequest) {
    try {
      const res = await Apollo.mutate<NewShareTypeResponse>({
        mutation: gqlNewShareType,
        variables: input,
      });

      if (res.data) {
        const [shareType] = res.data.newShareType;
        const instanceId = instanceStore.selected.value?.id ?? -1;
        const hasInstance = shareType?.shareTypeInstances.findIndex((x) => x.instanceId === instanceId) ?? false;

        if (store.query === gqlShareTypesByInstance && hasInstance >= 0) {
          store.shareTypes = [...store.shareTypes, shareType];
        }

        if (store.query === gqlAvailableShareTypes) {
          store.shareTypes = [...store.shareTypes, shareType];
        }
      } else {
        throw new Error('Unable to create Share Type: unknown error.');
      }
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  /**
   * Update a share type.
   *
   * @param {UpdateShareTypeRequest} input
   */
  async function updateShareType(input: UpdateShareTypeRequest) {
    try {
      const res = await Apollo.mutate<UpdateShareTypeResponse>({
        mutation: gqlUpdateShareType,
        variables: input,
      });

      if (res.data) {
        const [shareType] = res.data.updateShareType;
        const isListed = store.shareTypes.findIndex((x) => x.id === input.id);

        if (isListed >= 0) {
          const newShareTypes = [...store.shareTypes];
          newShareTypes[isListed] = shareType;
          store.shareTypes = newShareTypes;
        }
      }
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  /**
   * Link a share type to an instance.
   *
   * @param {LinkUnlinkShareTypeRequest} input
   */
  async function linkShareType(input: LinkUnlinkShareTypeRequest) {
    try {
      const res = await Apollo.mutate<LinkShareTypeResponse>({
        mutation: gqlLinkShareType,
        variables: input,
        update(cache) {
          cache.evict({
            id: 'ROOT_QUERY',
            fieldName: 'shareTypes',
          });

          cache.gc();
        },
      });

      if (res.data) {
        const isListed = store.shareTypes.findIndex((x) => x.id === input.shareTypeId);
        if (isListed >= 0) {
          const newShareTypes = [...store.shareTypes];
          // eslint-disable-next-line prefer-destructuring
          newShareTypes[isListed] = res.data.linkShareType[0];
          store.shareTypes = newShareTypes;
        }
      }

      if (!res.data) {
        throw new Error('Unable to link share to the given instance: unknown error.');
      }
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  /**
   * Unlink a share type from an instance.
   *
   * @param {LinkUnlinkShareTypeRequest} input
   */
  async function unlinkShareType(input: LinkUnlinkShareTypeRequest) {
    try {
      const res = await Apollo.mutate<UnlinkShareTypeResponse>({
        mutation: gqlUnlinkShareType,
        variables: input,
        update(cache) {
          cache.evict({
            id: 'ROOT_QUERY',
            fieldName: 'shareTypes',
            broadcast: false,
          });

          cache.gc();
        },
      });

      if (res.data) {
        const isListed = store.shareTypes.findIndex((x) => x.id === input.shareTypeId);
        if (isListed >= 0) {
          const newShareTypes = [...store.shareTypes];
          // eslint-disable-next-line prefer-destructuring
          newShareTypes[isListed] = res.data.unlinkShareType[0];
          store.shareTypes = newShareTypes;
        }
      }

      if (!res.data) {
        throw new Error('Unable to unlink share to the given instance: unknown error.');
      }
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  /**
   * Delete a share type.
   *
   * @param {ShareType} shareType
   */
  async function deleteShareType(shareType: ShareType) {
    try {
      const res = await Apollo.mutate<DeleteShareTypeResponse>({
        mutation: gqlDeleteShareType,
        variables: { id: shareType.id },
        update(cache) {
          cache.evict({
            id: cache.identify({ ...shareType }),
          });
        },
      });

      if (res.data && res.data.deleteShareType === true) {
        const isListed = store.shareTypes.findIndex((x) => x.id === shareType.id);
        if (isListed >= 0) {
          store.shareTypes = store.shareTypes.filter((x) => x.id !== shareType.id);
        }
      } else {
        throw new Error('Unable to delete Share Type: unknown reason.');
      }
    } catch (e) {
      throw e?.message ?? e;
    }
  }

  // If we're fetching by instance, re-fetch when it changes
  watch(() => instanceStore.selected.value, (newValue, oldValue) => {
    if (!store.byInstance) return;

    if (!newValue) {
      store.shareTypes = [];
    } else if (newValue.id !== (oldValue?.id ?? -1)) {
      fetch();
    }
  }, { immediate });

  return {
    instanceStore,
    loading,
    totalCount,
    pageInfo,
    shareTypes,
    totalTransactionPages,
    fetch,
    fetchNext,
    fetchPrevious,
    newShareType,
    updateShareType,
    linkShareType,
    unlinkShareType,
    deleteShareType,
  };
}

export type ShareTypeStore = ReturnType<typeof setup>;
