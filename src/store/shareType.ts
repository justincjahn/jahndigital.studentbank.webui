import Apollo from '@/services/Apollo';
import gqlAvailableShareTypes from '@/graphql/availableShareTypes.query.gql';
import gqlShareTypesByInstance from '@/graphql/shareTypes.query.gql';
import gqlNewShareType from '@/graphql/newShareType.mutation.gql';
import gqlUpdateShareType from '@/graphql/updateShareType.mutation.gql';
import gqlLinkShareType from '@/graphql/linkShareType.mutation.gql';
import gqlUnlinkShareType from '@/graphql/unlinkShareType.mutation.gql';
import gqlDeleteShareType from '@/graphql/deleteShareType.mutation.gql';
import { FETCH_OPTIONS } from '@/constants';
import { computed, reactive, watch } from 'vue';
import theInstanceStore, { InstanceStore } from '@/store/instance';

type FetchOptions = {
  available?: boolean;
  first?: number;
}

/**
 * Stores information about share types in the system.
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
    selected: null as ShareType|null,
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

  // SETs the selected share
  function setSelected(item: ShareType|null) { store.selected = item; }

  // Update the store with the response from the server
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

  // Fetch the initial list of shareTypes
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
        fetchPolicy: 'network-only',
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

  // Fetch the next page of shareTypes
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

  // Fetch the previous page of shareTypes
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

  // Create a new share type
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

  // Update a share type
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

  // Link a share type to an instance
  async function linkShareType(input: LinkUnlinkShareTypeRequest) {
    try {
      const res = await Apollo.mutate<LinkShareTypeResponse>({
        mutation: gqlLinkShareType,
        variables: input,
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

  // Unlink a share type from an instance
  async function unlinkShareType(input: LinkUnlinkShareTypeRequest) {
    try {
      const res = await Apollo.mutate<UnlinkShareTypeResponse>({
        mutation: gqlUnlinkShareType,
        variables: input,
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

  // Delete a share type
  async function deleteShareType(shareType: ShareType) {
    try {
      const res = await Apollo.mutate<DeleteShareTypeResponse>({
        mutation: gqlDeleteShareType,
        variables: { id: shareType.id },
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
  watch(() => instanceStore.selected.value, () => {
    if (!store.byInstance) return;
    if (instanceStore.selected.value === null) {
      store.shareTypes = [];
    } else {
      fetch();
    }
  }, { immediate });

  return {
    instanceStore,
    loading,
    totalCount,
    selected,
    pageInfo,
    shareTypes,
    totalTransactionPages,
    setSelected,
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

const store = setup(theInstanceStore);
export type ShareTypeStore = ReturnType<typeof setup>;
export default store;
