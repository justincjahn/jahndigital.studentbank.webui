<script lang="ts" setup>
import { defineAsyncComponent, ref, computed } from 'vue';

// Common
import injectStrict from '@/common/utils/injectStrict';
import { GLOBAL_STORE } from '@/admin/symbols';

// Components
import LoadingLabel from '@/common/components/LoadingLabel.vue';
import { VInput } from '@/common/components/inputs';

const ModalDialog = defineAsyncComponent(
  () => import('@/common/components/ModalDialog.vue')
);

const globalStore = injectStrict(GLOBAL_STORE);
const username = ref('');
const password = ref('');
const error = ref('');

const isLoading = computed(() => globalStore.user.loading.value);

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
    await globalStore.user.login(username.value, password.value, false);
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
  <modal-dialog
    title="Please login"
    submit-label="Login"
    :show="true"
    :can-cancel="false"
    :can-submit="canSubmit"
    @submit="login"
  >
    <v-input
      v-model="username"
      name="username"
      label="Email Address"
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

    <template #submitLabel="{ label }">
      <loading-label :show="isLoading">
        {{ label }}
      </loading-label>
    </template>
  </modal-dialog>
</template>
