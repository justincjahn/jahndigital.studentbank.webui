<script setup lang='ts'>
import '@/common/styles/common.css';

import { computed, onMounted, reactive, watchEffect } from 'vue';

import {
  SITE_NAME,
  SITE_DISABLE_NAME,
  SITE_LOGO,
  VERSION,
  BASE_URLS
} from '@/common/constants';

import userStore from '@/common/stores/user';
import errorStore from '@/common/stores/error';

// Components
import LoadingLabel from '@/common/components/LoadingLabel.vue';
import { VInput } from '@/common/components/inputs';
import ModalDialog from '@/common/components/ModalDialog.vue';

import validateAccount from '@/common/validators/validateAccount';
import validateInviteCode from '@/common/validators/validateInviteCode';
import validatePassword from '@/common/validators/validatePassword';
import validateEmail from '@/common/validators/validateEmail';

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

const isDataValid = computed(
  () => Object.values({ ...data.errors }).every((x) => x.length === 0)
);

const isPasswordValid = computed(
  () =>
    Object.values({ ...data.passwordErrors }).every((x) => x.length === 0) &&
    data.data.password.length > 0
);

const submitLabel = computed(() => {
  if (data.loading) return 'Please Wait...';
  return data.currentStep === 0 ? 'Next' : 'Register'
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
});

async function preregister()
{
  try {
    await userStore.preregister(
      data.data.inviteCode,
      data.data.accountNumber
    );
  } catch (e) {
    if (e instanceof Error) {
      console.error('[Preregistration] ' + (e?.message ?? e));
    }

    throw new Error(
      'Unable to find account.'
    )
  }

  if (userStore.isPreauthorized.value !== true) {
    throw new Error(
      'An unknown error occurred validating your registration. Please try again later.'
    );
  }
}

async function register()
{
  const res = await registerStudent({
    email: data.data.email,
    password: data.data.password
  });

  if (!res) {
    throw new Error('Invalid response!');
  }

  if (res.studentRegistration !== true) {
    throw new Error('Unable to complete registration.');
  }
}

async function handleSubmit()
{
  data.loading = true;

  if (data.currentStep == 0) {
    if (!isDataValid.value) return;

    try {
      await preregister();
      data.currentStep = 1;
    } catch (e) {
      if (e instanceof Error) {
        console.error('[Preregistration] ' + (e?.message ?? e));
        error.value = "Unable to locate your registration using the provided information. Please review your invite code, and account number and try again."
      }
    } finally {
      data.loading = false;
    }

    return;
  }

  if (data.currentStep === 1) {
    if (!isDataValid.value) return;
    if (!isPasswordValid.value) return;

    try {
      await register();

      try {
        await userStore.logout();
      } catch {
        // ignore
      }

      window.location.href = `/${BASE_URLS.STUDENT}`;
    } catch (e) {
      if (e instanceof Error) {
        console.error('[Registration] ' + (e?.message ?? e));
        error.value = "Unable to complete registration.  Please contact your advisor."
      }
    } finally {
      data.loading = false;
    }
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
  <header class='main-header'>
    <div class='container | flex-group'>
      <h1>
        <template v-if='SITE_LOGO'>
          <img
            :src='SITE_LOGO'
            :alt='`${SITE_NAME} Registration`'
          />
        </template>
        <template v-if='!SITE_DISABLE_NAME'>
          {{ SITE_NAME }}
        </template>

        Registration
      </h1>
    </div>
  </header>

  <main class='main-content'>
    <div class='container'>
      <form @submit.prevent='handleSubmit'>
        <template v-if='data.currentStep === 0'>
          <v-input
            v-model='data.data.inviteCode'
            v-model:error='data.errors.inviteCode'
            :validator='validateInviteCode'
            label='Invite Code'
            required
           />

          <v-input
            v-model='data.data.accountNumber'
            v-model:error='data.errors.accountNumber'
            label='Account Number (Student ID Number)'
            :validator='validateAccount'
            required
          />
        </template>

        <template v-if='data.currentStep === 1'>
          <v-input
            v-model='data.data.email'
            v-model:error='data.errors.email'
            name='email'
            label='Email Address'
            :validator='validateEmail'
            required
          />

          <v-input
            v-model='data.data.password'
            v-model:error='data.passwordErrors.password'
            type='password'
            name='new-password'
            label='Password'
            :validator='validatePassword()'
            required
          />

          <v-input
            v-model='data.data.passwordRepeat'
            v-model:error='data.passwordErrors.passwordRepeat'
            type='password'
            name='repeat-password'
            label='Repeat Password'
            required
          />
        </template>

        <button type='submit' class='primary' :disabled='!canSubmit'>
          <loading-label :show='data.loading'> {{ submitLabel }} </loading-label>
        </button>
      </form>
    </div>
  </main>

  <footer class='main-footer'>
    &copy; 2019-{{ new Date().getFullYear() }} Jahn Digital v{{ VERSION }}
  </footer>

  <modal-dialog
    :show='error !== null && error.length > 0'
    class='destructive'
    title='Error'
    @submit='() => (error = null)'
  >
    {{ error }}
  </modal-dialog>
</template>
