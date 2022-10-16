import { computed, reactive, watch } from 'vue';

// Types
import type { ShareType } from '@/admin/common/services/shareType';
import type { InstanceStore } from '@/admin/common/stores/instance';

// Composables
import usePagination from '@/common/composables/usePagination';

// GraphQL
import {
  getShareTypes,
  newShareType,
  updateShareType,
  linkShareType,
  unlinkShareType,
  deleteShareType,
  postDividends as servicePostDividends,
} from '@/admin/common/services/shareType';

/**
 * Stores information about share types in the system.
 *
 * @param instanceStore The {InstanceStore} to watch, if desired.
 */
export function setup(instanceStore?: InstanceStore) {
  const store = reactive({
    loading: false,
    instances: [] as number[],
    shareTypes: [] as ShareType[],
    selected: null as ShareType | null,
  });

  // True if the store is loading data
  const loading = computed(() => store.loading);

  // Get a list of fetched share types
  const shareTypes = computed(() => store.shareTypes);

  // Get or set the selected share type
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
  } = usePagination<Parameters<typeof getShareTypes>[0]>({
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
        const data = await getShareTypes(opts);

        if (!data.shareTypes) {
          throw new Error('No data returned');
        }

        store.shareTypes = data.shareTypes.nodes ?? [];

        return {
          pageInfo: data.shareTypes.pageInfo,
          totalCount: data.shareTypes.totalCount,
        };
      } finally {
        store.loading = false;
      }
    },

    async fetchNext(cursor, size) {
      store.loading = true;

      try {
        const data = await getShareTypes({
          instances: store.instances.length > 0 ? store.instances : undefined,
          first: size,
          after: cursor,
        });

        if (!data.shareTypes) {
          throw new Error('No data returned');
        }

        store.shareTypes = data.shareTypes.nodes ?? [];

        return {
          pageInfo: data.shareTypes.pageInfo,
          totalCount: data.shareTypes.totalCount,
        };
      } finally {
        store.loading = false;
      }
    },

    async fetchPrevious(cursor, size) {
      store.loading = true;

      try {
        const data = await getShareTypes({
          instances: store.instances.length > 0 ? store.instances : undefined,
          first: size,
          after: cursor,
        });

        if (!data.shareTypes) {
          throw new Error('No data returned');
        }

        store.shareTypes = data.shareTypes.nodes ?? [];

        return {
          pageInfo: data.shareTypes.pageInfo,
          totalCount: data.shareTypes.totalCount,
        };
      } finally {
        store.loading = false;
      }
    },
  });

  function sort(arr: ShareType[]) {
    arr.sort((a, b) =>
      // eslint-disable-next-line no-nested-ternary
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    );
  }

  /**
   * Create a new share type and add it to the store if it's in the same instance as
   * selected.
   *
   * @param input
   */
  async function create(input: Parameters<typeof newShareType>[0]) {
    const data = await newShareType(input);
    const [shareType] = data.newShareType;

    const instanceId: number = instanceStore?.selected.value?.id ?? -1;
    const hasInstance = shareType.shareTypeInstances.findIndex(
      (x) => x.instanceId === instanceId
    );

    if (
      (store.instances.length > 0 && hasInstance >= 0) ||
      store.instances.length <= 0
    ) {
      const newShareTypes = [...store.shareTypes, shareType];
      sort(newShareTypes);
      store.shareTypes = newShareTypes;
    }
  }

  /**
   * Update a share type and update the instance if it's in the same instance as
   * selected.
   *
   * @param input
   */
  async function update(input: Parameters<typeof updateShareType>[0]) {
    const data = await updateShareType(input);
    const [shareType] = data.updateShareType;
    const isListed = store.shareTypes.findIndex((x) => x.id === input.id);

    if (isListed >= 0) {
      const newShareTypes = [...store.shareTypes];
      newShareTypes[isListed] = shareType;
      sort(newShareTypes);
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
  async function link(input: Parameters<typeof linkShareType>[0]) {
    const data = await linkShareType(input);

    const isListed = store.shareTypes.findIndex(
      (x) => x.id === input.shareTypeId
    );

    if (isListed >= 0) {
      const newShareTypes = [...store.shareTypes];
      [newShareTypes[isListed]] = data.linkShareType;
      store.shareTypes = newShareTypes;
    } else if (store.instances.includes(input.instanceId)) {
      const newShareTypes = [...store.shareTypes, ...data.linkShareType];
      sort(newShareTypes);
      store.shareTypes = newShareTypes;
    }

    if (store.selected && store.selected.id === input.shareTypeId) {
      [store.selected] = data.linkShareType;
    }
  }

  /**
   * Unlink a share type from an instance.
   *
   * @param input
   */
  async function unlink(input: Parameters<typeof unlinkShareType>[0]) {
    const data = await unlinkShareType(input);

    const isListed = store.shareTypes.findIndex(
      (x) => x.id === input.shareTypeId
    );

    if (isListed >= 0) {
      const newShareTypes = [...store.shareTypes];
      [newShareTypes[isListed]] = data.unlinkShareType;
      store.shareTypes = newShareTypes;
    }

    if (store.selected && store.selected.id === input.shareTypeId) {
      store.selected = null;
    }
  }

  /**
   * Delete a share type.
   *
   * @param shareType
   */
  async function remove(shareType: ShareType) {
    const data = await deleteShareType(shareType);

    if (!data.deleteShareType) {
      throw new Error('Unable to delete Share Type: unknown reason.');
    }

    const isListed = store.shareTypes.findIndex((x) => x.id === shareType.id);

    if (isListed >= 0) {
      store.shareTypes = store.shareTypes.filter((x) => x.id !== shareType.id);
    }

    if (store.selected && store.selected.id === shareType.id) {
      store.selected = null;
    }
  }

  /**
   * Post dividends for the given shareTypeId and instance(s).
   *
   * @param input
   */
  async function postDividends(
    input: Parameters<typeof servicePostDividends>[0]
  ) {
    const data = await servicePostDividends(input);
    return data.postDividends;
  }

  // If we're fetching by instance, re-fetch when it changes
  watch(
    () => instanceStore?.selected.value,
    (newValue, oldValue) => {
      if (!newValue) {
        store.shareTypes = [];
      } else if (newValue.id !== (oldValue?.id ?? -1)) {
        fetch({});
      }
    }
  );

  return {
    // State
    loading,
    shareTypes,
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
    postDividends,
  };
}

export type ShareTypeStore = ReturnType<typeof setup>;
