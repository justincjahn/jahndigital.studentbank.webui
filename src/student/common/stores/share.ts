import type { UserStore } from '@/common/stores/user';
import type { Share } from '@/common/services/share';
import { reactive, computed, watchEffect } from 'vue';
import { getSharesByStudentId } from '@/common/services/share';

export function setup(userStore: UserStore) {
  const store = reactive({
    loading: false,
    shares: [] as Share[],
    selected: null as Share | null,
  });

  const loading = computed(() => store.loading);

  const shares = computed(() => store.shares);

  const selected = computed({
    get: () => store.selected,

    set(value) {
      store.selected = value;
    },
  });

  async function fetch() {
    const res = await getSharesByStudentId({
      studentId: userStore.id.value,
      cache: false,
    });

    if (!res.shares || !res.shares.nodes) return;
    store.shares = [...res.shares.nodes];
  }

  function dispose() {}

  watchEffect(() => {
    if (userStore.isAuthenticated.value) {
      fetch();
    }

    selected.value = null;
  });

  return {
    loading,
    shares,
    selected,
    dispose,
  };
}

export type ShareStore = ReturnType<typeof setup>;
