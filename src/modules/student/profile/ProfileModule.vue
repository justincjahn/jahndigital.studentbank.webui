<template>
  <router-view v-if="!loading" />
  <template v-else>
    <loading-label class="page-loading" />
  </template>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';

// Services
import { info } from '@/services/auth';

// Components
import LoadingLabel from '@/components/LoadingLabel.vue';

// Stores
import errorStore from '@/stores/error';

export default defineComponent({
  components: {
    LoadingLabel,
  },
  setup() {
    const loading = ref(true);

    onMounted(async () => {
      try {
        loading.value = true;
        await info();
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
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
