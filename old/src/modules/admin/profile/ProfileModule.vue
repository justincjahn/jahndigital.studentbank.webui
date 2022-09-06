<template>
  <router-view v-if="!loading" />
  <template v-else>
    <loading-label class="page-loading" />
  </template>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';

// Utils
import injectStrict from '@/utils/injectStrict';

// Services
import { info } from '@/services/auth';

// Components
import LoadingLabel from '@/components/LoadingLabel.vue';

// Stores
import { GLOBAL_STORE } from '../symbols';

export default defineComponent({
  components: {
    LoadingLabel,
  },
  setup() {
    const loading = ref(true);
    const globalStore = injectStrict(GLOBAL_STORE);

    onMounted(async () => {
      try {
        loading.value = true;
        await info();
      } catch (e) {
        if (e instanceof Error) {
          globalStore.error.setCurrentError(e?.message ?? e);
        }
      } finally {
        loading.value = false;
      }
    });

    return {
      loading,
    };
  },
});
</script>
