<script lang="ts" setup>
import type { UserStore } from '@/common/stores/user';

// Core
import { ref, computed } from 'vue';

import {
  SITE_NAME,
  SITE_DISABLE_NAME,
} from '@/common/constants';

// Components
import LoadingLabel from '@/common/components/LoadingLabel.vue';
import { VInput } from '@/common/components/inputs';

const props = withDefaults(
  defineProps<{
    store: UserStore;
    admin?: boolean;
  }>(),
  {
    admin: false,
  }
);

const username = ref('');
const password = ref('');
const error = ref('');

const isLoading = computed(() => props.store.loading.value);

const submitLabel = computed(() =>
  isLoading.value ? 'Please Wait...' : 'Login'
);

const usernameLabel = computed(() =>
  props.admin ? 'Email Address' : 'Account Number'
);

const canSubmit = computed(() => {
  if (isLoading.value) return false;
  if (username.value.length === 0) return false;
  if (password.value.length === 0) return false;
  return true;
});

async function login() {
  if (!canSubmit.value) return;

  error.value = '';

  try {
    await props.store.login(username.value, password.value, !props.admin);
  } catch (e: unknown) {
    if (!(e instanceof Error)) {
      error.value = 'An unknown error occurred.  Please try again.';
    } else {
      error.value = 'Invalid username or password.';
    }
  }
}
</script>

<template>
  <div class="login-dialog">
    <h1 v-if="!SITE_DISABLE_NAME">{{ SITE_NAME }} Login</h1>
    <h1 v-else>Please Login</h1>

    <form @submit.prevent="login">
      <v-input
        v-model="username"
        name="username"
        :label="usernameLabel"
        autocomplete="username"
        required
      />

      <v-input
        v-model="password"
        name="password"
        label="Password"
        type="password"
        autocomplete="current-password"
        required
      />

      <p v-if="error" class="error">
        {{ error }}
      </p>

      <button type="submit" class="primary">
        <loading-label :show="isLoading"> {{ submitLabel }} </loading-label>
      </button>
    </form>
  </div>
</template>

<style scoped>
.login-dialog {
  width: clamp(20rem, 30rem, 80vw);
  margin: 2rem auto;
}

.login-dialog form {
  padding: 1rem;
  border: 1px solid hsl(var(--clr-neutral-500));
  border-radius: var(--border-radius);
}

.login-dialog h1 {
  margin-bottom: 0.5em;
}

.login-dialog button[type='submit'] {
  width: 100%;
  margin-top: 1rem;
  height: 3em;
}

.error {
  margin-top: 1em;
}
</style>
