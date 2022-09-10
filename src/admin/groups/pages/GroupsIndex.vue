<script lang="ts" setup>
import { GLOBAL_STORE } from '@/admin/symbols';
import injectStrict from '@/common/utils/injectStrict';

const globalStore = injectStrict(GLOBAL_STORE);
setTimeout(() => {
  globalStore.error.error.value = 'Testing';
}, 3000);
</script>

<template>Groups Home!</template>
