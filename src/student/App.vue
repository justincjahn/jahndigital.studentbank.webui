<script setup lang="ts">
import '@/common/styles/common.css';
import { defineAsyncComponent } from 'vue';
import LoadingPage from '@/common/pages/LoadingPage.vue';

const WrappedApp = defineAsyncComponent(
  () => import('@/student/WrappedApp.vue')
);
</script>

<template>
  <suspense>
    <wrapped-app />

    <template #fallback>
      <loading-page :overlay="true" />
    </template>
  </suspense>
</template>
