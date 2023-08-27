<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import useGlobalStore from '@/student/common/composables/useGlobalStore';

import LoadingPage from '@/common/pages/LoadingPage.vue';

const ShareList = defineAsyncComponent(
  () => import('@/student/accounts/components/ShareList.vue')
);

const globalStore = useGlobalStore();
</script>

<template>
  <suspense>
    <share-list :store="globalStore" />

    <template #fallback>
      <loading-page />
    </template>
  </suspense>
</template>
