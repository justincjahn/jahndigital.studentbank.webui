<script setup lang="ts">
import '@/common/styles/common.css';
import confetti from 'canvas-confetti';

import { computed, onMounted, reactive, watchEffect } from 'vue';

import { VERSION, BASE_URLS } from '@/common/constants';

// Stores
import userStore from '@/common/stores/user';
import errorStore from '@/common/stores/error';

// Components
import LoadingLabel from '@/common/components/LoadingLabel.vue';
import { VInput } from '@/common/components/inputs';
import ModalDialog from '@/common/components/ModalDialog.vue';

// Validations
import validateAccount from '@/common/validators/validateAccount';
import validateInviteCode from '@/common/validators/validateInviteCode';
import validatePassword from '@/common/validators/validatePassword';
import validateEmail from '@/common/validators/validateEmail';

// Services
import { registerStudent } from '@/common/services/student';

const error = computed({
  get() {
    return errorStore.error.value;
  },
  set(value) {
    errorStore.setCurrentError(value);
  },
});

const data = reactive({
  loading: false,

  currentStep: 0,

  data: {
    email: '',
    currentPassword: '',
    password: '',
    passwordRepeat: '',
    inviteCode: '',
    accountNumber: '',
  },

  errors: {
    inviteCode: '',
    accountNumber: '',
    email: '',
  },

  passwordErrors: {
    password: '',
    passwordRepeat: '',
  },
});

const isDataValid = computed(() =>
  Object.values({ ...data.errors }).every((x) => x.length === 0)
);

const isPasswordValid = computed(
  () =>
    Object.values({ ...data.passwordErrors }).every((x) => x.length === 0) &&
    data.data.password.length > 0
);

const submitLabel = computed(() => {
  if (data.loading) return 'Please Wait...';
  if (data.currentStep == 0) return 'Next';
  if (data.currentStep == 1) return 'Register';
  return 'Log In';
});

const canSubmit = computed(() => {
  if (data.loading) return false;

  if (data.currentStep === 0) {
    if (data.data.accountNumber.trim().length === 0) return false;
    if (data.data.inviteCode.trim().length === 0) return false;
    return isDataValid.value;
  }

  if (data.currentStep === 1) {
    return isPasswordValid.value && isDataValid.value;
  }

  return true;
});

async function preregister() {
  await userStore.preregister(data.data.inviteCode, data.data.accountNumber);

  if (userStore.isPreauthorized.value !== true) {
    throw new Error('isPreauthorized should be true.');
  }
}

async function register() {
  const res = await registerStudent({
    email: data.data.email,
    password: data.data.password,
  });

  if (!res) {
    throw new Error('Invalid response!');
  }

  if (res.studentRegistration !== true) {
    throw new Error('Unable to complete registration, unknown error.');
  }
}

async function handleSubmit() {
  data.loading = true;

  if (data.currentStep == 0) {
    if (!isDataValid.value) return;

    try {
      await preregister();
      data.currentStep = 1;
    } catch (e) {
      if (e instanceof Error) {
        console.error(`[Preregistration] ${e.message}`);

        error.value =
          'Unable to locate your registration using the provided information. Please review your invite code and account number.';
      }
    } finally {
      data.loading = false;
    }

    return;
  }

  if (data.currentStep === 1) {
    if (!isDataValid.value || !isPasswordValid.value) return;

    try {
      await register();
      data.currentStep = 2;
    } catch (e) {
      if (e instanceof Error) {
        console.error(`[Preregistration] ${e.message}`);

        error.value =
          'Unable to complete registration.  Please contact your instructor.';
      }
    } finally {
      data.loading = false;
    }

    return;
  }

  if (data.currentStep === 2) {
    try {
      await userStore.logout();
    } catch {
      // ignore
    } finally {
      data.loading = false;
    }

    window.location.href = `/${BASE_URLS.STUDENT}`;
  }
}

// Watch password fields to ensure they match
watchEffect(() => {
  if (data.data.password !== data.data.passwordRepeat) {
    data.passwordErrors.passwordRepeat = 'Passwords do not match.';
  } else {
    data.passwordErrors.passwordRepeat = '';
  }
});

watchEffect(() => {
  if (data.currentStep === 2) {
    confetti({
      particleCount: 100,
      spread: window.innerWidth > 750 ? 200 : 80,
      origin: { y: window.innerWidth > 750 ? 0.6 : 0.4 },
    });
  }
});

// If the invite code was included in the URL, copy it into the form
onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const urlInviteCode = params.get('i');

  if (!urlInviteCode) return;
  if (!urlInviteCode.match(/[A-Za-z0-9]/)) return;
  data.data.inviteCode = urlInviteCode;
});
</script>

<template>
  <main class="main-content">
    <form class="container card" @submit.prevent="handleSubmit">
      <h1 class="size-xl">Registration</h1>

      <template v-if="data.currentStep === 0">
        <v-input
          v-model="data.data.inviteCode"
          v-model:error="data.errors.inviteCode"
          :validator="validateInviteCode"
          label="Invite Code"
          required
        />

        <v-input
          v-model="data.data.accountNumber"
          v-model:error="data.errors.accountNumber"
          label="Account Number (Student ID Number)"
          :validator="validateAccount"
          required
        />
      </template>

      <template v-if="data.currentStep === 1">
        <v-input
          v-model="data.data.email"
          v-model:error="data.errors.email"
          name="email"
          label="Email Address"
          :validator="validateEmail"
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
      </template>

      <template v-if="data.currentStep === 2">
        <p class="fieldset">
          Congratulations, your account has been registered! Log In and get
          started!
        </p>
      </template>

      <div class="fieldset flex-group" data-flex-type="end">
        <button type="submit" class="primary" :disabled="!canSubmit">
          <loading-label :show="data.loading">
            {{ submitLabel }}
          </loading-label>
        </button>
      </div>
    </form>
  </main>

  <footer class="main-footer">
    &copy; 2019-{{ new Date().getFullYear() }} Jahn Digital v{{ VERSION }}
  </footer>

  <modal-dialog
    :show="error !== null && error.length > 0"
    class="destructive"
    title="Error"
    @submit="() => (error = null)"
  >
    {{ error }}
  </modal-dialog>
</template>

<style lang="css" scoped>
form {
  --card-width: clamp(22rem, 30vw, 40rem);
  margin-top: 3rem;
}

h1 {
  margin-bottom: 1rem;
}

@media screen and (min-width: 47rem) {
  .main-content {
    margin-top: 0;
    justify-content: center;
  }
}
</style>
