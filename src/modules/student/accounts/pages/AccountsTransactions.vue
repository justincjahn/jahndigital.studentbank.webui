<template>
  <div class="account-transactions">
    <suspense>
      <template #default>
        <transaction-list />
      </template>
      <template #fallback>
        <loading-label class="loading" />
      </template>
    </suspense>
  </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, watch } from 'vue';
import { useRoute } from 'vue-router';

// Components
import LoadingLabel from '@/components/LoadingLabel.vue';

// Store
import injectStrict from '@/utils/injectStrict';
import { GLOBAL_STORE } from '../../symbols';

export default defineComponent({
  components: {
    LoadingLabel,
    TransactionList: defineAsyncComponent(() => import('../components/TransactionList.vue')),
  },
  setup() {
    const globalStore = injectStrict(GLOBAL_STORE);
    const route = useRoute();

    // Hydrate the selected share from the route
    watch(() => route.params.shareId, (newId) => {
      if (globalStore.shares.value.length === 0) return;
      if (typeof newId === 'undefined') return;

      const share = globalStore.shares.value.find((x) => x.id === +newId);
      if (share) globalStore.selectedShare.value = share;
    }, { immediate: true });

    // When the selected share changes, fetch/clear transactions
    watch(() => globalStore.selectedShare.value, (newShare, oldShare) => {
      if (!newShare) {
        globalStore.clearTransactions();
        return;
      }

      if (!globalStore.selectedShare.value) return;
      if (newShare !== oldShare) {
        globalStore.fetchShareTransactions({
          shareId: globalStore.selectedShare.value.id,
        });
      }
    }, { immediate: true });

    return {};
  },
});
</script>

<style lang="scss">
  .account-transactions {
    margin: 0 2em;
  }
</style>
