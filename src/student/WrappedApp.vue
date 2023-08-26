<script setup lang="ts">
// Styles
import '@/student/common/styles/layout.css';

// Core
import { provide, onUnmounted, computed } from 'vue';

// Stores
import { setup as defineGlobalStore } from '@/student/common/stores/global';

// Utils
import { GLOBAL_STORE } from '@/student/symbols';

import {
  SITE_NAME,
  SITE_DISABLE_NAME,
  SITE_LOGO,
  VERSION,
  BASE_URLS,
} from '@/common/constants';

// Components
import LoadingPage from '@/common/pages/LoadingPage.vue';
import LoginPage from '@/common/pages/LoginPage.vue';

const globalStore = defineGlobalStore();
provide(GLOBAL_STORE, globalStore);
onUnmounted(() => globalStore.dispose());

const isLoading = computed(() => globalStore.router.loading.value);

const isHydrated = computed(() => globalStore.user.isHydrated.value);

const isAuthenticated = computed(() => globalStore.user.isAuthenticated.value);

if (!globalStore.user.isAnonymous.value && !globalStore.user.isStudent.value) {
  const baseUrl = `${import.meta.env.BASE_URL}/`.replace('//', '/');
  window.location.href = `${baseUrl}${BASE_URLS.ADMIN}/`;
}
</script>

<template>
  <template v-if="isAuthenticated">
    <header>
      <img v-if="SITE_LOGO" :src="SITE_LOGO" :alt="`${SITE_NAME} Admin`" />
      <h1 v-if="!SITE_DISABLE_NAME">{{ SITE_NAME }}</h1>
    </header>

    <main v-if="isLoading" class="router-loading"><loading-page /></main>
    <main v-else><router-view /></main>

    <footer>
      &copy; 2019-{{ new Date().getFullYear() }} Jahn Digital v{{ VERSION }}
    </footer>
  </template>
  <template v-else-if="!isHydrated">
    <loading-page :overlay="true" />
  </template>
  <template v-else>
    <login-page :store="globalStore.user" :admin="false" />
  </template>
</template>
