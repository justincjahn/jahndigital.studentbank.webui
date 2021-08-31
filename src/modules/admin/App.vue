<template>
  <header v-if="isAuthenticated">
    <section class="main-nav">
      <h1>
        <template v-if="SITE_LOGO">
          <img
            :src="SITE_LOGO"
            :alt="`${SITE_NAME} Admin`"
          />
        </template>
        <template v-if="!SITE_DISABLE_NAME">
          {{ SITE_NAME }}
        </template>

        Admin
      </h1>

      <div class="main-nav__instances">
        <template v-if="isAuthenticated">
          <suspense>
            <instance-selector
              v-model="selectedInstance"
              :store="globalStore"
            />
          </suspense>
        </template>
      </div>

      <div class="main-nav__login">
        <suspense><login-widget /></suspense>
      </div>
    </section>

    <section class="sub-nav">
      <router-link :to="{name: studentsIndex }" class="sub-nav--link">
        Students
      </router-link>
      <router-link :to="{name: groupsIndex }" class="sub-nav--link">
        Groups
      </router-link>
      <router-link :to="{name: stocksIndex }" class="sub-nav--link">
        Stocks
      </router-link>
      <router-link :to="{name: purchasesIndex }" class="sub-nav--link">
        Purchases
      </router-link>
      <router-link :to="{name: profileIndex }" class="sub-nav--link">
        Profile
      </router-link>
      <router-link :to="{name: settingsIndex }" class="sub-nav--link">
        Settings
      </router-link>
    </section>
  </header>

  <main v-if="!loading">
    <router-view />
  </main>

  <main v-else class="loading">
    <h1>Loading...</h1>
  </main>

  <footer>&copy; 2020 Jahn Digital v{{ VERSION }}</footer>

  <suspense>
    <modal
      :show="error !== null"
      class="destructive"
      title="Error"
      @ok="setCurrentError(null)"
    >
      {{ error }}
    </modal>
  </suspense>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, watchEffect, provide, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { BASE_URLS, SITE_NAME, SITE_DISABLE_NAME, SITE_LOGO, VERSION } from '@/constants';

// Routes
import GroupRouteNames from '@/modules/admin/groups/routeNames';
import StudentRouteNames from '@/modules/admin/students/routeNames';
import PurchasesRouteNames from '@/modules/admin/purchases/routeNames';
import StocksRouteNames from '@/modules/admin/stocks/routeNames';
import ProfileRouteNames from '@/modules/admin/profile/routeNames';
import SettingsRouteNames from '@/modules/admin/settings/routeNames';
import LoginRouteNames from '@/modules/admin/login/routeNames';

// Services
import { info } from '@/services/auth';

// Stores
import { setup as defineGlobalStore } from './stores/global';
import * as symbols from './symbols';

export default defineComponent({
  components: {
    LoginWidget: defineAsyncComponent(() => import(/* webpackChunkName: "admin-main" */ '@/modules/admin/components/LoginWidget.vue')),
    InstanceSelector: defineAsyncComponent(() => import(/* webpackChunkName: "admin-main" */ '@/modules/admin/components/InstanceSelector.vue')),
    Modal: defineAsyncComponent(() => import(/* webpackChunkName: "admin-main" */ '@/components/Modal.vue')),
  },
  setup() {
    const router = useRouter();

    // Define a new GlobalStore for child pages to use
    const globalStore = defineGlobalStore();
    provide(symbols.GLOBAL_STORE, globalStore);

    // Force users to the login page if they aren't authenticated, also logs off students
    watchEffect(() => {
      if (globalStore.user.isAnonymous.value) {
        router.push({ name: LoginRouteNames.index });
      } else if (globalStore.user.isStudent.value) {
        window.location.href = `/${BASE_URLS.STUDENT}`;
      } else if (!globalStore.user.hasInfo.value) {
        info();
      }
    });

    // Watch for when the user authenticates and fetch instances if there are none
    watchEffect(() => {
      if (globalStore.user.isAuthenticated.value && !globalStore.instance.selected.value) {
        globalStore.instance.fetchInstances();
      }
    });

    onUnmounted(() => globalStore.dispose());

    return {
      SITE_NAME,
      SITE_DISABLE_NAME,
      SITE_LOGO,
      VERSION,
      globalStore,
      groupsIndex: GroupRouteNames.index,
      studentsIndex: StudentRouteNames.index,
      purchasesIndex: PurchasesRouteNames.index,
      stocksIndex: StocksRouteNames.index,
      profileIndex: ProfileRouteNames.index,
      settingsIndex: SettingsRouteNames.index,
      selectedInstance: globalStore.instance.selected,
      error: globalStore.error.error,
      setCurrentError: globalStore.error.setCurrentError,
      loading: globalStore.router.loading,
      isAuthenticated: globalStore.user.isAuthenticated,
    };
  },
});
</script>

<style lang="scss">
@import './scss/index.scss';

main.loading {
  font-size: 1.5em;
  opacity: 0.8;
  text-align: center;
}
</style>
