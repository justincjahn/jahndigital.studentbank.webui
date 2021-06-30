import { computed, reactive, watch } from 'vue';
import { FETCH_OPTIONS } from '@/constants';

// Stores
import { InstanceStore } from '@/modules/admin/stores/instance';

// GraphQL
import * as shareTypeService from '@/services/shareType';

/**
 * Stores information about share types in the system.
 *
 * @param instanceStore The {InstanceStore} to watch, if desired.
 * @param immediate If the store should immediately try to fetch share types instead of waiting for change.
 */
export function setup(instanceStore?: InstanceStore) {
  const store = reactive({
    loading: false,
    totalCount: 0,
    pageInfo: null as PageInfo|null,
    pageCount: FETCH_OPTIONS.DEFAULT_COUNT,
    cursorStack: [] as string[],
    instances: [] as number[],
    shareTypes: [] as ShareType[],
    selected: null as ShareType|null,
  });

  const loading = computed(() => store.loading);

  const selected = computed({
    get: () => store.selected,
    set: (value) => {
      store.selected = value;
    },
  });

  const totalCount = computed(() => store.totalCount);

  const pageInfo = computed(() => store.pageInfo);

  const shareTypes = computed(() => store.shareTypes);

  const currentFetchCount = computed(() => store.pageCount);

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
    store.shareTypes = res.shareTypes.nodes;
    store.pageInfo = res.shareTypes.pageInfo;
    store.totalCount = res.shareTypes.totalCount;
  }

  /**
   * Fetch the initial list of shareTypes.
   *
   * If no instances are provided in options, and an instanceStore was passed in via setup, then
   * fetch will retrieve the ShareTypes available to that instance.
   *
   * @param options
   */
  async function fetch(options?: shareTypeService.FetchOptions) {
    const opts = {
      first: store.pageCount,
      cache: true,
      instances: instanceStore ? [instanceStore.selected.value?.id ?? -1] : undefined,
      ...options,
    };

    if (opts.instances) {
      store.instances = opts.instances;
    }

    store.loading = true;

    try {
      const data = await shareTypeService.getShareTypes(opts);
      set(data);
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

    try {
      const data = await shareTypeService.getShareTypes({
        instances: store.instances.length > 0 ? store.instances : undefined,
        first: store.pageCount,
        after: endCursor,
      });

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

    try {
      const data = await shareTypeService.getShareTypes({
        instances: store.instances.length > 0 ? store.instances : undefined,
        first: currentFetchCount.value,
        after: stack[stack.length - 1] ?? null,
      });

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
    const instanceId = instanceStore?.selected.value?.id ?? -1;
    const hasInstance = shareType?.shareTypeInstances.findIndex((x) => x.instanceId === instanceId) ?? false;

    if (store.instances.length > 0 && hasInstance >= 0) {
      store.shareTypes = [...store.shareTypes, shareType];
    }

    if (store.instances.length <= 0) {
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

      if (store.selected && store.selected.id === input.id) {
        store.selected = shareType;
      }
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

      if (store.selected && store.selected.id === input.shareTypeId) {
        [store.selected] = data.linkShareType;
      }
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

      if (store.selected && store.selected.id === input.shareTypeId) {
        store.selected = null;
      }
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

      if (store.selected && store.selected.id === shareType.id) {
        store.selected = null;
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
  watch(() => instanceStore?.selected.value, (newValue, oldValue) => {
    if (!newValue) {
      store.shareTypes = [];
    } else if (newValue.id !== (oldValue?.id ?? -1)) {
      fetch();
    }
  });

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
    selected,
  };
}

export type ShareTypeStore = ReturnType<typeof setup>;
