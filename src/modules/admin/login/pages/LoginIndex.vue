<template>
  <modal
    title="Please Login"
    ok-label="Login"
    :show="!isAuthenticated"
    :can-cancel="false"
    :handle-escape="false"
    :can-submit="canSubmit"
    :handle-enter="canSubmit"
    @ok="login"
  >
    <form class="admin-login" @submit.prevent="login">
      <label for="username">Email Address</label>
      <input
        id="username"
        v-model="username"
        type="text"
        name="username"
        autocomplete="username"
      />

      <label for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        name="password"
        autocomplete="current-password"
      />

      <p v-if="error" class="error">
        {{ error }}
      </p>
    </form>
  </modal>
</template>

<script>
import { ref, computed, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

// Stores
import userStore from '@/stores/user';

// Services
import { userLogin } from '@/services/auth';

// Components
import Modal from '@/components/Modal.vue';

export default {
  components: {
    Modal,
  },
  setup() {
    const router = useRouter();
    const username = ref('');
    const password = ref('');
    const error = ref('');

    const canSubmit = computed(() => {
      if (userStore.loading.value) return false;
      if (username.value.length === 0) return false;
      if (password.value.length === 0) return false;
      return true;
    });

    async function login() {
      if (!canSubmit.value) return;

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
      canSubmit,
      isAuthenticated: userStore.isAuthenticated,
    };
  },
};
</script>

<style lang="scss">
  .admin-login {
    display: flex;
    flex-direction: column;

    h1 {
      text-align: center;
      margin-bottom: 1em;
    }

    .error {
      margin-top: 1em;
    }

    input + label {
      margin-top: 1em;
    }
  }
</style>
