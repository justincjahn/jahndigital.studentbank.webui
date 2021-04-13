<template>
  <div class="main-panel full">
    <form class="admin-login" @submit.prevent="login">
      <label for="username">Username</label>
      <input v-model="username" type="text" name="username" />

      <label for="password">Password</label>
      <input v-model="password" type="password" name="password" />

      <p v-if="error.length > 0">
        {{ error }}
      </p>

      <input type="submit" value="Login" :disabled="userStore.loading.value" />
    </form>
  </div>
</template>

<script>
import { ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import userStore from '@/store/user';
import AuthenticationService from '@/services/AuthenticationService';
import Apollo from '@/services/Apollo';

export default {
  setup() {
    const router = useRouter();
    const username = ref('');
    const password = ref('');
    const error = ref('');

    // TODO: Not a fan of the global userStore being manipulated by the auth service and the Apollo service.
    async function login() {
      const auth = new AuthenticationService(Apollo);

      try {
        await auth.login(username.value, password.value);
        error.value = '';
      } catch (e) {
        error.value = e;
      }
    }

    watchEffect(() => {
      if (userStore.isAuthenticated.value) {
        router.push({ name: 'index' });
      }
    });

    return {
      username,
      password,
      error,
      login,
      userStore,
    };
  },
};
</script>

<style lang="scss">
  form.admin-login {
    display: flex;
    flex-direction: column;
    width: 300px;
    margin: 0px auto;

    & label {
      font-weight: bold;
      text-align: left;
      margin-top: 1em;
    }

    & input[type=text], & input[type=password] {
      height: 30px;
      font-size: 1.1em;
    }

    & input[type=submit] {
      height: 30px;
      margin-top: 2em;
    }
  }
</style>
