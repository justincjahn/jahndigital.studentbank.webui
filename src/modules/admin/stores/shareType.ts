import { computed, reactive, watch } from 'vue';
import { FETCH_OPTIONS } from '@/constants';

// Stores
import { InstanceStore } from '@/modules/admin/stores/instance';

// GraphQL
import * as shareTypeService from '@/services/shareType';

/**
 * Options used on the initial fetch.
 */
interface FetchOptions extends shareTypeService.FetchOptions {
  available?: boolean;
}

/**
 * Stores information about share types in the system.
 *
 * When the provided InstanceStore's currently selected Instance changes, the store will
 * automatically fetch Share Types for the new instance if it changes and fetch wasn't already
 * called with {FetchOptions.available}.
 *
 * @param instanceStore The InstanceStore to watch.
 * @param immediate If the store should immediatley try to fetch share types instead of waiting for change.
 */
export function setup(instanceStore: InstanceStore, immediate = true) {
  const store = reactive({
    loading: false,
    byInstance: true,
    totalCount: 0,
    pageInfo: null as PageInfo|null,
    pageCount: FETCH_OPTIONS.DEFAULT_COUNT,
    cursorStack: [] as string[],
    shareTypes: [] as ShareType[],
  });

  const loading = computed(() => store.loading);

  const totalCount = computed(() => store.totalCount);

  const pageInfo = computed(() => store.pageInfo);

  const shareTypes = computed(() => store.shareTypes);

  const currentFetchCount = computed(() => store.pageCount ?? FETCH_OPTIONS.DEFAULT_COUNT);

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
  function set(res: CombinedPagedShareTypeResponse) {
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
   * @param options
   */
  async function fetch(options?: FetchOptions) {
    const opts = {
      first: store.pageCount,
      available: false,
      cache: true,
      ...options,
    };

    store.loading = true;

    try {
      if (opts.available) {
        const data = await shareTypeService.getAvailableShareTypes(opts);
        store.byInstance = false;
        set(data);
      } else {
        const data = await shareTypeService.getShareTypesByInstance({
          ...opts,
          instanceId: instanceStore.selected.value?.id ?? -1,
        });

        set(data);
      }
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
      first: store.pageCount,
      after: endCursor,
    };

    try {
      let data: CombinedPagedShareTypeResponse;
      if (store.byInstance) {
        data = await shareTypeService.getShareTypesByInstance(variables);
      } else {
        data = await shareTypeService.getAvailableShareTypes(variables);
      }

      store.cursorStack = [...store.cursorStack, endCursor];
      set(data);
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
      let data: CombinedPagedShareTypeResponse;
      if (store.byInstance) {
        data = await shareTypeService.getShareTypesByInstance(variables);
      } else {
        data = await shareTypeService.getAvailableShareTypes(variables);
      }

      store.cursorStack = stack;
      set(data);
    } finally {
      store.loading = false;
    }
  }

  /**
   * Create a new share type.
   *
   * @param input
   */
  async function newShareType(input: NewShareTypeRequest) {
    const data = await shareTypeService.newShareType(input);
    const [shareType] = data.newShareType;
    const instanceId = instanceStore.selected.value?.id ?? -1;
    const hasInstance = shareType?.shareTypeInstances.findIndex((x) => x.instanceId === instanceId) ?? false;

    if (store.byInstance && hasInstance >= 0) {
      store.shareTypes = [...store.shareTypes, shareType];
    }

    if (!store.byInstance) {
      store.shareTypes = [...store.shareTypes, shareType];
    }
  }

  /**
   * Update a share type.
   *
   * @param input
   */
  async function updateShareType(input: UpdateShareTypeRequest) {
    const data = await shareTypeService.updateShareType(input);
    const [shareType] = data.updateShareType;
    const isListed = store.shareTypes.findIndex((x) => x.id === input.id);

    if (isListed >= 0) {
      const newShareTypes = [...store.shareTypes];
      newShareTypes[isListed] = shareType;
      store.shareTypes = newShareTypes;
    }
  }

  /**
   * Link a share type to an instance.
   *
   * @param input
   */
  async function linkShareType(input: LinkUnlinkShareTypeRequest) {
    const data = await shareTypeService.linkShareType(input);
    const isListed = store.shareTypes.findIndex((x) => x.id === input.shareTypeId);
    if (isListed >= 0) {
      const newShareTypes = [...store.shareTypes];
      // eslint-disable-next-line prefer-destructuring
      newShareTypes[isListed] = data.linkShareType[0];
      store.shareTypes = newShareTypes;
    }
  }

  /**
   * Unlink a share type from an instance.
   *
   * @param input
   */
  async function unlinkShareType(input: LinkUnlinkShareTypeRequest) {
    const data = await shareTypeService.unlinkShareType(input);
    const isListed = store.shareTypes.findIndex((x) => x.id === input.shareTypeId);
    if (isListed >= 0) {
      const newShareTypes = [...store.shareTypes];
      // eslint-disable-next-line prefer-destructuring
      newShareTypes[isListed] = data.unlinkShareType[0];
      store.shareTypes = newShareTypes;
    }
  }

  /**
   * Delete a share type.
   *
   * @param shareType
   */
  async function deleteShareType(shareType: ShareType) {
    const data = await shareTypeService.deleteShareType(shareType);
    if (data.deleteShareType === true) {
      const isListed = store.shareTypes.findIndex((x) => x.id === shareType.id);
      if (isListed >= 0) {
        store.shareTypes = store.shareTypes.filter((x) => x.id !== shareType.id);
      }
    } else {
      throw new Error('Unable to delete Share Type: unknown reason.');
    }
  }

  /**
   * Post dividends for the given shareTypeId and instance(s).
   *
   * @param input
   */
  async function postDividends(input: DividendPostingRequest) {
    const data = await shareTypeService.postDividends(input);
    return data.postDividends;
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
    postDividends,
  };
}

export type ShareTypeStore = ReturnType<typeof setup>;
