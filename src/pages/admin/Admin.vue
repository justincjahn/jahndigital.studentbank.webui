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
      <router-link :to="{name: 'Students'}">Students</router-link>
      <router-link :to="{name: 'Groups'}">Groups</router-link>
      <router-link :to="{name: 'Stocks'}">Stocks</router-link>
      <router-link :to="{name: 'Purchases'}">Purchases</router-link>
      <router-link :to="{name: 'Settings'}">Settings</router-link>
    </section>
  </header>

  <main>
    <div class="loading" v-if="loading"><loading-icon>Loading, please wait...</loading-icon></div>
    <router-view v-else />
  </main>

  <footer>&copy; 2020 Jahn Digital</footer>

  <suspense>
    <Modal
      :show="errorStore.error.value !== null"
      customClass="destructive"
      title="Error"
      @ok="errorStore.setCurrentError(null)"
    >
      {{errorStore.error.value}}
    </Modal>
  </suspense>
</template>

<style lang="scss">
@import '@/scss/admin.scss';
</style>

<script>
import routerStore from '@/store/router';
import userStore from '@/store/user';
import errorStore from '@/store/error';
import LoadingIcon from '@/components/LoadingIcon.vue';
import { useRouter } from 'vue-router';
import { defineAsyncComponent, watchEffect } from 'vue';

export default {
  components: {
    LoginWidget: defineAsyncComponent(() => import(/* webpackChunkName: "admin-main" */ '@/components/admin/navigation/TheLoginWidget.vue')),
    InstanceSelector: defineAsyncComponent(() => import(/* webpackChunkName: "admin-main" */ '@/components/admin/navigation/TheInstanceSelector.vue')),
    Modal: defineAsyncComponent(() => import(/* webpackChunkName: "admin-main" */ '@/components/Modal.vue')),
    LoadingIcon,
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
      errorStore,
      userStore,
      loading: routerStore.loading,
    };
  },
};
</script>

<style scoped>
  .loading {
    font-size: 2em;
  }
</style>
