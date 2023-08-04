<script lang="ts" setup>
import '@/admin/common/styles/layout.css';

import {
  defineAsyncComponent,
  provide,
  onUnmounted,
  computed,
  watchEffect,
} from 'vue';

// Stores
import { setup as defineGlobalStore } from '@/admin/common/stores/global';

// Common
import { GLOBAL_STORE } from '@/admin/symbols';

import GroupRouteNames from '@/admin/groups/routeNames';
import StudentRouteNames from '@/admin/students/routeNames';
import StockRouteNames from '@/admin/stocks/routeNames';

import {
  SITE_NAME,
  SITE_DISABLE_NAME,
  SITE_LOGO,
  VERSION,
} from '@/common/constants';

// Components
import LoadingPage from '@/common/components/LoadingPage.vue';
import ModalDialog from '@/common/components/ModalDialog.vue';
import LoginDialog from '@/admin/common/components/LoginDialog.vue';

const LoginWidget = defineAsyncComponent(
  () => import('@/admin/common/components/LoginWidget.vue')
);

const InstanceSelector = defineAsyncComponent(
  () => import('@/admin/common/components/InstanceSelector.vue')
);

const globalStore = defineGlobalStore();
provide(GLOBAL_STORE, globalStore);
onUnmounted(() => globalStore.dispose());

const isLoading = computed(() => globalStore.router.loading.value);

const isHydrated = computed(() => globalStore.user.isHydrated.value);

const isAuthenticated = computed(() => globalStore.user.isAuthenticated.value);

const error = computed({
  get() {
    return globalStore.error.error.value;
  },
  set(value) {
    globalStore.error.setCurrentError(value);
  },
});

const currentInstance = computed({
  get() {
    return globalStore.instance.selected.value;
  },

  set(val) {
    globalStore.instance.selected.value = val;
  },
});

watchEffect(() => {
  if (isAuthenticated.value && !currentInstance.value) {
    globalStore.instance.fetch();
  }
});
</script>

<template>
  <template v-if="isAuthenticated">
    <header>
      <h1>
        <template v-if="SITE_LOGO">
          <img :src="SITE_LOGO" :alt="`${SITE_NAME} Admin`" />
        </template>
        <template v-if="!SITE_DISABLE_NAME">
          {{ SITE_NAME }}
        </template>
      </h1>

      <div class="main-nav__instances">
        <suspense>
          <instance-selector v-model="currentInstance" :store="globalStore" />
        </suspense>
      </div>

      <div class="main-nav__login"><login-widget /></div>
    </header>

    <nav class="sub-nav">
      <router-link :to="{ name: StudentRouteNames.index }">
        Students
      </router-link>
      <router-link :to="{ name: GroupRouteNames.index }">Groups</router-link>
      <router-link :to="{ name: StockRouteNames.index }">Stocks</router-link>
    </nav>

    <main v-if="isLoading"><loading-page /></main>
    <main v-else><router-view /></main>

    <footer>&copy; 2022 Jahn Digital v{{ VERSION }}</footer>

    <modal-dialog
      :show="error !== null && error.length > 0"
      class="destructive"
      title="Error"
      @submit="() => (error = null)"
    >
      {{ error }}
    </modal-dialog>
  </template>
  <template v-else-if="!isHydrated">
    <loading-page />
  </template>
  <template v-else>
    <login-dialog />
  </template>
</template>
