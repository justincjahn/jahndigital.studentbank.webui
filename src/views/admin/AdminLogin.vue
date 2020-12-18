<template>
  <div class="main-panel full">
    <form class="admin-login" @submit.prevent="login">
      <label for="username">Username</label>
      <input type="text" name="username" v-model="username" />

      <label for="password">Password</label>
      <input type="password" name="password" v-model="password" />

      <p v-if="error.length > 0">{{error}}</p>

      <input type="submit" value="Login" :disabled="UserState.loading" />
    </form>
  </div>
</template>

<script>
import { ref, watchEffect } from 'vue';
import UserState from '@/store/modules/user';
import AuthenticationService from '@/services/AuthenticationService';
import { useRouter } from 'vue-router';
import Apollo from '@/services/Apollo';

export default {
  setup() {
    const router = useRouter();
    const username = ref('');
    const password = ref('');
    const error = ref('');

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
      if (UserState.isAuthenticated === true) {
        router.push({ name: 'Home' });
      }
    });

    return {
      username,
      password,
      error,
      login,
      UserState,
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
