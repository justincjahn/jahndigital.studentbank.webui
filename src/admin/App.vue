<template>
  <header v-if="globalStore.user.isAuthenticated.value">
    <h1>
      <template v-if="SITE_LOGO">
        <img :src="SITE_LOGO" :alt="`${SITE_NAME} Admin`" />
      </template>
      <template v-if="!SITE_DISABLE_NAME">
        {{ SITE_NAME }}
      </template>
    </h1>

    <div class="main-nav__instances">Instances...</div>

    <div class="main-nav__login">Login Widget...</div>
  </header>

  <main><router-view /></main>

  <footer>&copy; 2022 Jahn Digital v{{ VERSION }}</footer>

  <suspense>
    <modal-dialog :show="true" class="destructive" title="Error">
      Test
    </modal-dialog>
  </suspense>
</template>

<script lang="ts" setup>
import '@/common/styles/common.css';

import { onUnmounted, provide, defineAsyncComponent } from 'vue';

import {
  SITE_NAME,
  SITE_DISABLE_NAME,
  SITE_LOGO,
  VERSION,
} from '@/common/constants';

import * as symbols from '@/admin/symbols';
import { setup as defineGlobalStore } from '@/admin/common/stores/global';

const ModalDialog = defineAsyncComponent(
  () => import('@/common/components/ModalDialog.vue')
);

const globalStore = defineGlobalStore();
provide(symbols.GLOBAL_STORE, globalStore);
onUnmounted(() => globalStore.dispose());
</script>
