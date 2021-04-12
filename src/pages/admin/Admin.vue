<template>
  <header>
    <section class="main-nav">
      <h1>Student Bank Admin</h1>

      <div class="main-nav__instances">
        <template v-if="userStore.isAuthenticated.value">
          <suspense><instance-selector /></suspense>
        </template>
      </div>

      <div class="main-nav__login">
        <suspense><login-widget /></suspense>
      </div>
    </section>

    <section class="sub-nav">
      <router-link :to="{name: studentsIndex }">
        Students
      </router-link>
      <router-link :to="{name: groupsIndex }">
        Groups
      </router-link>
      <router-link :to="{name: stocksIndex }">
        Stocks
      </router-link>
      <router-link :to="{name: purchasesIndex }">
        Purchases
      </router-link>
      <router-link :to="{name: settingsIndex }">
        Settings
      </router-link>
    </section>
  </header>

  <main>
    <router-view />
  </main>

  <footer>&copy; 2020 Jahn Digital</footer>

  <suspense>
    <Modal
      :show="errorStore.error.value !== null"
      class="destructive"
      title="Error"
      @ok="errorStore.setCurrentError(null)"
    >
      {{ errorStore.error.value }}
    </Modal>
  </suspense>
</template>

<script>
import { RouteNames as GroupRouteNames } from '@/modules/admin/groups/routes';
import { RouteNames as StudentRouteNames } from '@/modules/admin/students/routes';
import { RouteNames as PurchasesRouteNames } from '@/modules/admin/purchases/routes';
import { RouteNames as StocksRouteNames } from '@/modules/admin/stocks/routes';
import { RouteNames as SettingsRouteNames } from '@/modules/admin/settings/routes';
import routerStore from '@/store/router';
import userStore from '@/store/user';
import errorStore from '@/store/error';
import { useRouter } from 'vue-router';
import { defineAsyncComponent, watchEffect } from 'vue';

export default {
  components: {
    LoginWidget: defineAsyncComponent(() => import(/* webpackChunkName: "admin-main" */ '@/modules/admin/components/LoginWidget.vue')),
    InstanceSelector: defineAsyncComponent(() => import(/* webpackChunkName: "admin-main" */ '@/modules/admin/components/TheInstanceSelector.vue')),
    Modal: defineAsyncComponent(() => import(/* webpackChunkName: "admin-main" */ '@/components/Modal.vue')),
  },

  setup() {
    const router = useRouter();

    // Force users to the login page if they aren't authenticated
    watchEffect(() => {
      if (userStore.isAuthenticated.value === false && !userStore.jwtToken.value) {
        router.push({ name: 'login' });
      }
    });

    return {
      groupsIndex: GroupRouteNames.index,
      studentsIndex: StudentRouteNames.index,
      purchasesIndex: PurchasesRouteNames.index,
      stocksIndex: StocksRouteNames.index,
      settingsIndex: SettingsRouteNames.index,
      errorStore,
      userStore,
      loading: routerStore.loading,
    };
  },
};
</script>

<style lang="scss">
@import '@/scss/admin.scss';
</style>

<style scoped>
  .loading {
    font-size: 2em;
  }
</style>
