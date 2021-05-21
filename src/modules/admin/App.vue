<template>
  <header v-if="isAuthenticated">
    <section class="main-nav">
      <h1>Student Bank Admin</h1>

      <div class="main-nav__instances">
        <template v-if="isAuthenticated">
          <suspense>
            <instance-selector
              v-model="selectedInstance"
              :instance-store="instanceStore"
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

  <footer>&copy; 2020 Jahn Digital</footer>

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
import { BASE_URLS } from '@/constants';
import { defineAsyncComponent, defineComponent, watchEffect, computed, provide } from 'vue';
import { useRouter } from 'vue-router';

// Routes
import GroupRouteNames from '@/modules/admin/groups/routeNames';
import StudentRouteNames from '@/modules/admin/students/routeNames';
import PurchasesRouteNames from '@/modules/admin/purchases/routeNames';
import StocksRouteNames from '@/modules/admin/stocks/routeNames';
import SettingsRouteNames from '@/modules/admin/settings/routeNames';
import LoginRouteNames from '@/modules/admin/login/routeNames';

// Services
import { info } from '@/services/auth';

// Stores
import routerStore from '@/store/router';
import errorStore from '@/store/error';
import userStore from '@/store/user';
import { setup as defineInstanceStore } from './stores/instance';
import { setup as defineShareTypeStore } from './stores/shareType';
import * as symbols from './symbols';

export default defineComponent({
  components: {
    LoginWidget: defineAsyncComponent(() => import(/* webpackChunkName: "admin-main" */ '@/modules/admin/components/LoginWidget.vue')),
    InstanceSelector: defineAsyncComponent(() => import(/* webpackChunkName: "admin-main" */ '@/modules/admin/components/InstanceSelector.vue')),
    Modal: defineAsyncComponent(() => import(/* webpackChunkName: "admin-main" */ '@/components/Modal.vue')),
  },
  setup() {
    const router = useRouter();

    // Create and provide the instance store to the child routes
    const instanceStore = defineInstanceStore();
    provide(symbols.INSTANCE_STORE_SYMBOL, instanceStore);

    // Create and provide the share type store to the child routes
    const shareTypeStore = defineShareTypeStore(instanceStore);
    provide(symbols.SHARE_TYPE_STORE_SYMBOL, shareTypeStore);

    const selectedInstance = computed<Instance|null>({
      get: () => instanceStore.selected.value,
      set: (item) => (instanceStore.selected.value !== item) && instanceStore.setSelected(item),
    });

    // Force users to the login page if they aren't authenticated, also logs off students
    watchEffect(() => {
      if (userStore.isAnonymous.value) {
        router.push({ name: LoginRouteNames.index });
      } else if (userStore.isStudent.value) {
        window.location.href = `/${BASE_URLS.STUDENT}`;
      } else if (!userStore.hasInfo.value) {
        info();
      }
    });

    // Watch for when the user authenticates and fetch instances if there are none
    watchEffect(() => {
      if (userStore.isAuthenticated.value && !instanceStore.selected.value) {
        instanceStore.fetchInstances();
      }
    });

    return {
      groupsIndex: GroupRouteNames.index,
      studentsIndex: StudentRouteNames.index,
      purchasesIndex: PurchasesRouteNames.index,
      stocksIndex: StocksRouteNames.index,
      settingsIndex: SettingsRouteNames.index,
      selectedInstance,
      instanceStore,
      error: errorStore.error,
      setCurrentError: errorStore.setCurrentError,
      loading: routerStore.loading,
      isAuthenticated: userStore.isAuthenticated,
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
