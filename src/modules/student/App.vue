<template>
  <header v-if="isAuthenticated">
    <section class="main-nav">
      <h1>Student Bank</h1>

      <div class="main-nav__login">
        <login-widget />
      </div>
    </section>

    <nav class="sub-nav">
      <router-link :to="{ name: accountIndex }">
        Accounts
      </router-link>

      <router-link :to="{ name: stocksIndex }">
        Stocks
      </router-link>
    </nav>
  </header>

  <main v-if="!loading">
    <router-view />
  </main>

  <main v-else>
    <loading-label class="page-loading" />
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

<script type="ts">
import { defineComponent, defineAsyncComponent, provide, watchEffect, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

// Components
import LoadingLabel from '@/components/LoadingLabel.vue';

// Services
import { info } from '@/services/auth';

// Stores
import userStore from '@/store/user';
import routerStore from '@/store/router';
import errorStore from '@/store/error';
import { setup as defineGlobalStore } from './stores/global';

// Route Names
import LoginRouteNames from './login/routeNames';
import AccountRouteNames from './accounts/routeNames';
import StocksRouteNames from './stocks/routeNames';

// Symbols
import { GLOBAL_STORE } from './symbols';

export default defineComponent({
  components: {
    LoadingLabel,
    LoginWidget: defineAsyncComponent(() => import('./login/components/LoginWidget.vue')),
    Modal: defineAsyncComponent(() => import('@/components/Modal.vue')),
  },
  setup() {
    const router = useRouter();

    // Provide the Global Store to children
    const globalStore = defineGlobalStore();
    provide(GLOBAL_STORE, globalStore);

    async function getInfo() {
      try {
        await info();
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      }
    }

    // Force users to the login page if they aren't authenticated
    watchEffect(() => {
      if (userStore.isAnonymous.value) {
        router.push({ name: LoginRouteNames.index });
      } else if (!userStore.hasInfo.value && !userStore.loading.value) {
        getInfo();
      }
    });

    onUnmounted(() => globalStore.dispose());

    return {
      isAuthenticated: userStore.isAuthenticated,
      loading: routerStore.loading,
      ...errorStore,
      accountIndex: AccountRouteNames.index,
      stocksIndex: StocksRouteNames.index,
    };
  },
});
</script>

<style lang="scss">
@import "./scss/index.scss";
</style>
