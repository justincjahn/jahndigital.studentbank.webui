<script setup lang="ts">
import type { GlobalStore } from '@/student/common/stores/global';

defineProps<{
  store: GlobalStore;
}>();
</script>

<template>
  <div v-for="share in store.share.shares.value" :key="share.id">
    {{ share.shareType.name }}
  </div>
</template>
