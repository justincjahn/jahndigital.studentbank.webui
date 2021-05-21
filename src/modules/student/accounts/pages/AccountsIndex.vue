<template>
  <suspense>
    <share-list
      :shares="orderedShares"
      @start-transfer="startTransfer"
    />
  </suspense>

  <router-view />
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

// Store
import injectStrict from '@/utils/injectStrict';
import { GLOBAL_STORE } from '../../symbols';

// Route Names
import AccountsRouteNames from '../routeNames';

export default defineComponent({
  components: {
    ShareList: defineAsyncComponent(() => import('../components/ShareList.vue')),
  },
  setup() {
    const globalStore = injectStrict(GLOBAL_STORE);
    const router = useRouter();

    const orderedShares = computed(() => {
      const shares = [...globalStore.shares.value];
      shares.sort(((a, b) => (((a.shareType?.name ?? '') > (b.shareType?.name ?? '')) ? 1 : -1)));
      return shares;
    });

    function startTransfer(share: Share) {
      console.log(share);
    }

    // Select the first share if none is selected
    watch(() => router.currentRoute.value, (newRoute) => {
      if (newRoute.name !== AccountsRouteNames.index) return;
      if (globalStore.shares.value.length === 0) return;

      if (!globalStore.selectedShare.value) {
        console.log(orderedShares.value);
        [globalStore.selectedShare.value] = orderedShares.value;
      }

      router.push({
        name: AccountsRouteNames.transactions,
        params: {
          shareId: globalStore.selectedShare.value.id,
        },
      });
    }, { immediate: true });

    return {
      orderedShares,
      startTransfer,
    };
  },
});
</script>
