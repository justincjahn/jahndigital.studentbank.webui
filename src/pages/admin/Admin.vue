<template>
  <header>
    <section class="main-nav">
      <h1>Student Bank Admin</h1>

      <div class="main-nav__instances">
        <template v-if="userStore.isAuthenticated.value">
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
    :show="errorStore.error.value !== null"
    customClass="destructive"
    title="Error"
    @ok="errorStore.setCurrentError(null)"
  >
    {{errorStore.error.value}}
  </Modal>
</template>

<style lang="scss">
@import '@/scss/admin.scss';
</style>

<script>
import LoginWidget from '@/components/admin/navigation/TheLoginWidget.vue';
import InstanceSelector from '@/components/admin/navigation/TheInstanceSelector.vue';
import Modal from '@/components/Modal.vue';
import userStore from '@/store/user';
import errorStore from '@/store/error';
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
      if (userStore.isAuthenticated.value === false && !userStore.jwtToken.value) {
        router.push({ name: 'login' });
      }
    });

    return {
      errorStore,
      userStore,
    };
  },
};
</script>
