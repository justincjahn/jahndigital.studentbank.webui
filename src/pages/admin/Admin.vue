<template>
  <header>
    <section class="main-nav">
      <h1>Student Bank Admin</h1>

      <div class="main-nav__instances">
        <template v-if="UserStore.isAuthenticated">
          <instance-selector />
        </template>
      </div>

      <div class="main-nav__login">
        <login-widget />
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

  <main><router-view/></main>

  <footer>&copy; 2020 Jahn Digital</footer>

  <Modal
    :show="GlobalState.currentError !== null"
    customClass="destructive"
    title="Error"
    @ok="GlobalState.setCurrentError(null)"
  >
    {{GlobalState.currentError}}
  </Modal>
</template>

<style lang="scss">
@import '@/scss/admin.scss';
</style>

<script>
import LoginWidget from '@/components/admin/navigation/TheLoginWidget.vue';
import InstanceSelector from '@/components/admin/navigation/TheInstanceSelector.vue';
import Modal from '@/components/Modal.vue';
import UserStore from '@/store/modules/user';
import GlobalState from '@/store/modules/global';
import { useRouter } from 'vue-router';
import { watchEffect } from 'vue';

export default {
  components: {
    LoginWidget,
    InstanceSelector,
    Modal,
  },

  setup() {
    const router = useRouter();

    // Force users to the login page if they aren't authenticated
    watchEffect(() => {
      if (UserStore.isAuthenticated === false && !UserStore.jwtToken) {
        router.push({ name: 'login' });
      }
    });

    return {
      GlobalState,
      UserStore,
    };
  },
};
</script>
