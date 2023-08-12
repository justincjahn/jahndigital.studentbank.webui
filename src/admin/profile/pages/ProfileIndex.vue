<script setup lang="ts">
import { reactive, ref, computed, watchEffect } from 'vue';

import injectStrict from '@/common/utils/injectStrict';
import { GLOBAL_STORE } from '@/admin/symbols';

import { updateUser } from '@/admin/common/services/user';

import validateEmail from '@/common/validators/validateEmail';
import validatePassword from '@/common/validators/validatePassword';

import VInput from '@/common/components/inputs/VInput.vue';

const globalStore = injectStrict(GLOBAL_STORE);

const data = reactive({
  data: {
    email: '',
    currentPassword: '',
    password: '',
    passwordRepeat: '',
  },

  errors: {
    email: '',
  },

  passwordErrors: {
    currentPassword: '',
    password: '',
    passwordRepeat: '',
  },
});

const loading = ref(false);

const isDataValid = computed(
  () =>
    Object.values({ ...data.errors }).every((x) => x.length === 0) &&
    data.data.email !== globalStore.user.email.value
);

const isPasswordValid = computed(
  () =>
    Object.values({ ...data.passwordErrors }).every((x) => x.length === 0) &&
    data.data.password.length > 0 &&
    data.data.currentPassword.length > 0
);

async function handleSave() {
  loading.value = true;

  try {
    await updateUser({
      id: globalStore.user.id.value,
      email: data.data.email,
    });

    await globalStore.user.refreshInfo();
  } catch (e) {
    if (e instanceof Error) {
      globalStore.error.setCurrentError(e.message);
    }
  } finally {
    loading.value = false;
  }
}

async function handleChangePassword() {
  loading.value = true;

  try {
    await updateUser({
      id: globalStore.user.id.value,
      currentPassword: data.data.currentPassword,
      password: data.data.password,
    });
  } catch (e) {
    if (e instanceof Error) {
      globalStore.error.setCurrentError(e.message);
    }
  } finally {
    loading.value = false;
  }
}

watchEffect(() => {
  if (data.data.password !== data.data.passwordRepeat) {
    data.passwordErrors.passwordRepeat = 'Passwords do not match.';
  } else {
    data.passwordErrors.passwordRepeat = '';
  }
});

watchEffect(() => {
  data.data.email = globalStore.user.email.value;
});
</script>

<template>
  <div class="main-content">
    <h2>Account Info</h2>

    <form @submit.prevent="handleSave">
      <v-input
        v-model="data.data.email"
        v-model:error="data.errors.email"
        label="Email"
        help-text="Your email address is also your username."
        :validator="validateEmail"
      />

      <button type="submit" class="primary" :disabled="!isDataValid">
        Update
      </button>
    </form>

    <h2>Change Password</h2>
    <form @submit.prevent="handleChangePassword">
      <v-input
        v-model="data.data.currentPassword"
        v-model:error="data.passwordErrors.currentPassword"
        type="password"
        name="current-password"
        label="Current Password"
        required
      />

      <v-input
        v-model="data.data.password"
        v-model:error="data.passwordErrors.password"
        type="password"
        name="new-password"
        label="Password"
        :validator="validatePassword()"
        required
      />

      <v-input
        v-model="data.data.passwordRepeat"
        v-model:error="data.passwordErrors.passwordRepeat"
        type="password"
        name="repeat-password"
        label="Repeat Password"
        required
      />

      <button type="submit" class="primary" :disabled="!isPasswordValid">
        Change Password
      </button>
    </form>
  </div>
</template>

<style scoped>
.main-content {
  padding-inline: 1rem;
}

form {
  display: block;
  padding: 1.5rem;
  background-color: hsl(var(--clr-neutral-300));
  border: 1px solid hsl(var(--clr-neutral-400));
  border-radius: var(--border-radius);
}

form + h2 {
  margin-top: 1rem;
}

button[type='submit'] {
  width: 100%;
  margin-top: 2rem;
  height: 3em;
}
</style>
