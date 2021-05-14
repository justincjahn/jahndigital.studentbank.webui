<template>
  <div class="main-panel full">
    <form class="admin-login" @submit.prevent="login">
      <label for="username">Username</label>
      <input v-model="username" type="text" name="username" />

      <label for="password">Password</label>
      <input v-model="password" type="password" name="password" />

      <p v-if="error" class="error">
        {{ error }}
      </p>

      <input type="submit" value="Login" :disabled="loading" />
    </form>
  </div>
</template>

<script>
import { ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

// Stores
import userStore from '@/store/user';

// Services
import { userLogin } from '@/services/auth';

export default {
  setup() {
    const router = useRouter();
    const username = ref('');
    const password = ref('');
    const error = ref('');

    async function login() {
      try {
        await userLogin({
          username: username.value,
          password: password.value,
        });

        error.value = '';
      } catch (e) {
        error.value = 'Invalid username or password.';
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
      loading: userStore.loading,
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
