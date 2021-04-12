<template>
  <router-view />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  setup() {
    const isReady = computed(() => true);

    return {
      isReady,
    };
  },
});
</script>
