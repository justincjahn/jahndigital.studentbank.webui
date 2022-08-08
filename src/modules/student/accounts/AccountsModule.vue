<template>
  <template v-if="!loading">
    <router-view />
  </template>
  <loading-label v-else class="page-loading" />
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

// Stores
import errorStore from '@/stores/error';
import userStore from '@/stores/user';

// Utils
import injectStrict from '@/utils/injectStrict';

// Components
import LoadingLabel from '@/components/LoadingLabel.vue';

// Symbols
import { GLOBAL_STORE } from '../symbols';

export default defineComponent({
  components: {
    LoadingLabel,
  },
  setup() {
    const loading = ref(true);
    const globalStore = injectStrict(GLOBAL_STORE);

    // Fetch shares when the user's ID changes or they login
    watch(() => userStore.id.value, async (newId, oldId) => {
      if (newId !== -1 && oldId !== newId) {
        loading.value = true;

        try {
          await globalStore.fetchShares(newId);
        } catch (e) {
          if (e instanceof Error) {
            errorStore.setCurrentError(e?.message ?? e);
          }
        } finally {
          loading.value = false;
        }
      }
    }, { immediate: true });

    return {
      loading,
    };
  },
});
</script>
