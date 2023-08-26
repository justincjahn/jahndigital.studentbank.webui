<script lang="ts" setup>
import type { UserStore } from '@/common/stores/user';

// Core
import { defineAsyncComponent, ref, computed } from 'vue';

// Components
import LoadingLabel from '@/common/components/LoadingLabel.vue';
import { VInput } from '@/common/components/inputs';

const ModalDialog = defineAsyncComponent(
  () => import('@/common/components/ModalDialog.vue')
);

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

    <template #submitLabel="{ label }">
      <loading-label :show="isLoading">
        {{ label }}
      </loading-label>
    </template>
  </modal-dialog>
</template>
