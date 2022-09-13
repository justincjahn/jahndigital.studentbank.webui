<script lang="ts" setup>
import { computed } from 'vue';
import injectStrict from '@/common/utils/injectStrict';
import { GLOBAL_STORE } from '@/admin/symbols';

const globalStore = injectStrict(GLOBAL_STORE);
const username = computed(() => globalStore.user.username.value);
const isAuthenticated = computed(() => globalStore.user.isAuthenticated.value);
const logout = () => globalStore.user.logout();
</script>

<template>
  <template v-if="isAuthenticated">
    {{ username }}
    (<a href="#" @click="logout">Logout</a>)
  </template>
</template>
