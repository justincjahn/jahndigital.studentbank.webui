<script setup lang="ts">
import { computed, reactive, ref, watch, watchEffect } from 'vue';

// Utils
import injectStrict from '@/common/utils/injectStrict';
import { GLOBAL_STORE } from '@/admin/symbols';

// Validators
import validateAccountUnique from '@/common/validators/validateAccountUnique';
import validateEmailOptional from '@/common/validators/validateEmailOptional';
import validatePassword from '@/common/validators/validatePassword';

// Components
import { VInput } from '@/common/components/inputs';
import LoadingLabel from '@/common/components/LoadingLabel.vue';

interface StudentErrorsDTO {
  accountNumber: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface PasswordErrorsDTO {
  password: string;
  repeatPassword: string;
}

interface StudentDataDTO {
  id: number;
  accountNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  repeatPassword: string;
}

interface StudentDTO {
  student: StudentDataDTO;
  errors: StudentErrorsDTO;
  passwordErrors: PasswordErrorsDTO;
}

const data = reactive<StudentDTO>({
  student: {
    id: -1,
    accountNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    repeatPassword: '',
  },

  errors: {
    accountNumber: '',
    firstName: '',
    lastName: '',
    email: '',
  },

  passwordErrors: {
    password: '',
    repeatPassword: '',
  },
});

const isInfoValid = computed(() =>
  Object.values({ ...data.errors }).every((x) => x.length === 0)
);

const isPasswordValid = computed(
  () =>
    data.student.password.length > 0 &&
    Object.values({ ...data.passwordErrors }).every((x) => x.length === 0)
);

const loading = ref(false);

const globalStore = injectStrict(GLOBAL_STORE);

const instanceId = computed(
  () => globalStore.instance.selected.value?.id ?? -1
);

const validateAccount = validateAccountUnique(
  instanceId,
  computed(() => data.student.id)
);

async function handleInfoSubmit() {
  if (!isInfoValid.value) return;
  if (globalStore.student.selected.value === null) return;

  const email =
    data.student.email.trim().length > 0 ? data.student.email : undefined;

  const student = {
    ...globalStore.student.selected.value,
    accountNumber: data.student.accountNumber,
    firstName: data.student.firstName,
    lastName: data.student.lastName,
    email,
  };

  loading.value = true;

  try {
    await globalStore.student.update(student);
  } catch (e) {
    if (e instanceof Error) {
      globalStore.error.setCurrentError(e.message);
    }
  } finally {
    loading.value = false;
  }
}

async function handlePasswordSubmit() {
  if (!isPasswordValid.value) return;
  if (globalStore.student.selected.value === null) return;

  loading.value = true;

  try {
    await globalStore.student.updatePassword(
      globalStore.student.selected.value.id,
      data.student.password
    );

    data.student.password = '';
    data.student.repeatPassword = '';
  } catch (e) {
    if (e instanceof Error) {
      globalStore.error.setCurrentError(e.message);
    }
  } finally {
    loading.value = false;
  }
}

watch(
  () => globalStore.student.selected.value,

  (newValue) => {
    if (newValue === null) return;

    data.student = {
      ...newValue,
      email: newValue.email ?? '',
      password: '',
      repeatPassword: '',
    };
  },

  { immediate: true }
);

watchEffect(() => {
  if (data.student.password !== data.student.repeatPassword) {
    data.passwordErrors.repeatPassword = 'Passwords do not match.';
  } else {
    data.passwordErrors.repeatPassword = '';
  }
});
</script>

<template>
  <form @submit.prevent="handleInfoSubmit">
    <h2>Account Info</h2>

    <v-input
      v-model="data.student.accountNumber"
      v-model:error="data.errors.accountNumber"
      label="Account Number"
      required
      :validator="validateAccount"
    />

    <v-input
      v-model="data.student.firstName"
      v-model:error="data.errors.firstName"
      label="First Name"
      required
    />

    <v-input
      v-model="data.student.lastName"
      v-model:error="data.errors.lastName"
      label="Last Name"
      required
    />

    <v-input
      v-model="data.student.email"
      v-model:error="data.errors.email"
      label="Email"
      :validator="validateEmailOptional"
    />

    <button type="submit" class="primary" :disabled="!isInfoValid || loading">
      <loading-label :show="loading">
        {{ loading ? 'Loading...' : 'Save' }}
      </loading-label>
    </button>
  </form>

  <form autocomplete="off" @submit.prevent="handlePasswordSubmit">
    <h2>Change Password</h2>

    <v-input
      v-model="data.student.password"
      v-model:error="data.passwordErrors.password"
      type="password"
      label="Password"
      autocomplete="off"
      :validator="validatePassword()"
      required
    />

    <v-input
      v-model="data.student.repeatPassword"
      :error="data.passwordErrors.repeatPassword"
      type="password"
      label="Repeat Password"
      autocomplete="off"
    />

    <button
      type="submit"
      class="primary"
      :disabled="!isPasswordValid || loading"
    >
      <loading-label :show="loading">
        {{ loading ? 'Loading...' : 'Change' }}
      </loading-label>
    </button>
  </form>
</template>

<style scoped>
form {
  display: block;
  padding: 1.5rem;
  background-color: hsl(var(--clr-neutral-300));
  border: 1px solid hsl(var(--clr-neutral-400));
  border-radius: var(--border-radius);
}

form + form {
  margin-top: 1rem;
}

h2 {
  margin-bottom: 0.5em;
}

button[type='submit'] {
  width: 100%;
  margin-top: 2rem;
  height: 3em;
}
</style>
