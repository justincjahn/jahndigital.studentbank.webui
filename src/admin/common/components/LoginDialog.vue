<script lang="ts" setup>
import { defineAsyncComponent, ref, computed } from 'vue';

// Common
import injectStrict from '@/common/utils/injectStrict';
import { GLOBAL_STORE } from '@/admin/symbols';

// Components
import LoadingLabel from '@/common/components/LoadingLabel.vue';

const ModalDialog = defineAsyncComponent(
  () => import('@/common/components/ModalDialog.vue')
);

const globalStore = injectStrict(GLOBAL_STORE);
const username = ref('');
const password = ref('');
const error = ref('');

const canSubmit = computed(() => {
  if (globalStore.user.loading.value) return false;
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
    ok-label="Login"
    :show="true"
    :can-cancel="false"
    :handle-escape="false"
    :can-submit="canSubmit"
    :handle-enter="canSubmit"
    @ok="login"
  >
    <form class="admin-login" @submit.prevent="login">
      <div class="fieldset">
        <label for="username">Email Address</label>
        <input
          id="username"
          v-model="username"
          type="text"
          name="username"
          autocomplete="username"
        />
      </div>

      <div class="fieldset">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          name="password"
          autocomplete="current-password"
        />
      </div>

      <p v-if="error" class="error">
        {{ error }}
      </p>
    </form>

    <template #okLabel="{ okLabel: label, canSubmit: enabled }">
      <loading-label :show="!enabled"> {{ label }} </loading-label>
    </template>
  </modal-dialog>
</template>
