<script setup lang="ts">
// Styles
import '@/student/common/styles/layout.css';

// Core
import { defineAsyncComponent, provide, onUnmounted, computed } from 'vue';

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

import AccountsRouteNames from '@/student/accounts/routeNames';

// Components
import LoadingPage from '@/common/pages/LoadingPage.vue';
import LoginPage from '@/common/pages/LoginPage.vue';

const LoginWidget = defineAsyncComponent(
  () => import('@/common/components/LoginWidget.vue')
);

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
  <div class="main-wrapper">
    <template v-if="isAuthenticated">
      <header class="main-header">
        <div class="container">
          <div class="inner flex-group">
            <div class="flex-group">
              <img v-if="SITE_LOGO" :src="SITE_LOGO" :alt="`${SITE_NAME}`" />
              <h1 v-if="!SITE_DISABLE_NAME">{{ SITE_NAME }}</h1>
            </div>

            <div class="login-widget">
              <login-widget :store="globalStore.user" />
            </div>
          </div>
        </div>
      </header>

      <nav class="sub-nav | container section" data-flex-type="start">
        <div class="inner flex-group" data-flex-type="start">
          <router-link :to="{ name: AccountsRouteNames.index }">
            Accounts
          </router-link>
        </div>
      </nav>

      <div class="container flex-grow-1">
        <main v-if="isLoading" class="inner"><loading-page /></main>
        <main v-else class="inner"><router-view /></main>
      </div>

      <footer class="main-footer | inner">
        &copy; 2019-{{ new Date().getFullYear() }} Jahn Digital v{{ VERSION }}
      </footer>
    </template>

    <template v-else-if="!isHydrated">
      <loading-page :overlay="true" />
    </template>

    <template v-else>
      <login-page :store="globalStore.user" :admin="false" />
    </template>
  </div>
</template>
