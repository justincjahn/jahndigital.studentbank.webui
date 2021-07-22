<template>
  <div class="registration-card">
    <h1>Student Registration</h1>

    <form @submit.prevent="handleSubmit">
      <fieldset v-if="currentStep === Step.step1" class="registration-card__step-1">
        <div class="fieldset">
          <label for="registration-card--invite-code">Invite Code</label>

          <input
            id="registration-card--invite-code"
            v-model="inviteCode"
            type="text"
            name="inviteCode"
          />

          <p v-if="inviteCodeError" class="error">
            {{ inviteCodeError }}
          </p>
        </div>

        <div class="fieldset">
          <label for="registration-card--account-number">Account Number (Student ID Number)</label>

          <input
            id="registration-card--account-number"
            v-model="accountNumber"
            type="text"
            name="accountNumber"
          />

          <p v-if="accountNumberError" class="error">
            {{ accountNumberError }}
          </p>
        </div>

        <div class="buttons">
          <button
            type="submit"
            class="primary"
            :disabled="!isValid"
          >
            <loading-label :show="loading">
              Next
            </loading-label>
          </button>
        </div>
      </fieldset>

      <fieldset v-if="currentStep === Step.step2" class="registration-card__step-2">
        <div class="fieldset">
          <label for="registration-card--email">Email Address</label>

          <input
            id="registration-card--email"
            v-model="email"
            type="text"
            name="email"
          />

          <p v-if="emailError" class="error">
            {{ emailError }}
          </p>
        </div>

        <div class="fieldset">
          <label for="registration-card--password">Password</label>

          <input
            id="registration-card--password"
            v-model="password"
            type="password"
            name="new-password"
          />

          <p v-if="passwordError" class="error">
            {{ passwordError }}
          </p>
        </div>

        <div class="fieldset">
          <label for="registration-card--repeat-password">Repeat Password</label>

          <input
            id="registration-card--repeat-password"
            v-model="repeatPassword"
            type="password"
            name="repeat-password"
          />
        </div>

        <div class="buttons">
          <button
            type="submit"
            class="primary"
            :disabled="!isValid"
          >
            <loading-label :show="loading">
              Register
            </loading-label>
          </button>
        </div>
      </fieldset>
    </form>
  </div>

  <suspense>
    <modal
      title="Whoops!"
      class="destructive registration-modal"
      :show="error !== null"
      @ok="resetError"
    >
      {{ error }}
    </modal>
  </suspense>
</template>

<script lang="ts">
import { BASE_URLS } from '@/constants';
import { defineAsyncComponent, defineComponent, ref, onMounted, computed } from 'vue';

// Utils
import { validateAccount, validateInviteCode, validateEmail, validatePassword } from '@/utils/validators';

// Composables
import useValidation from '@/composables/useValidation';

// Services
import { studentPreregistration } from '@/services/auth';
import { registerStudent } from '@/services/student';

// Stores
import errorStore from '@/stores/error';
import userStore from '@/stores/user';

enum Step {
  step1,
  step2,
}

export default defineComponent({
  components: {
    LoadingLabel: defineAsyncComponent(() => import('@/components/LoadingLabel.vue')),
    Modal: defineAsyncComponent(() => import('@/components/Modal.vue')),
  },
  setup() {
    // Global state
    const loading = ref(false);
    const currentStep = ref<Step>(Step.step1);

    // Step 1 fields
    const { value: inviteCode, error: inviteCodeError } = useValidation(validateInviteCode);
    const { value: accountNumber, error: accountNumberError } = useValidation(validateAccount);

    // Step 2 fields
    const repeatPassword = ref('');
    const { value: email, error: emailError } = useValidation(validateEmail);
    const { value: password, error: passwordError } = useValidation(validatePassword(repeatPassword));

    const isValid = computed(() => {
      if (currentStep.value >= Step.step1) {
        if (inviteCodeError.value) return false;
        if (accountNumberError.value) return false;
      }

      if (currentStep.value >= Step.step2) {
        if (emailError.value) return false;
        if (passwordError.value) return false;
      }

      return !loading.value;
    });

    /**
     * Clear the error message.
     */
    function resetError() { errorStore.setCurrentError(null); }

    /**
     * Attempt to obtain a preregistration token or throw an error.
     */
    async function preregister() {
      loading.value = true;

      try {
        await studentPreregistration({
          inviteCode: inviteCode.value.toUpperCase(),
          accountNumber: accountNumber.value.padStart(10, '0'),
        });

        if (userStore.email.value) email.value = userStore.email.value;
        currentStep.value = Step.step2;
      } catch (e) {
        console.error('[Preregistration Error]', e);
        errorStore.setCurrentError('Unable to verify your registration status.  Please check your invite code and account number and try again.');
      } finally {
        loading.value = false;
      }
    }

    /**
     * Finalize the registration of the student.
     */
    async function register() {
      loading.value = true;

      try {
        await registerStudent({
          email: email.value,
          password: password.value,
        });

        userStore.setToken(null);
        window.location.href = `/${BASE_URLS.STUDENT}`;
      } catch (e) {
        console.error('[Registration Error]', e);
        errorStore.setCurrentError(e?.message ?? e);
      } finally {
        loading.value = false;
      }
    }

    /**
     * Handle submission for each step in the process.
     */
    function handleSubmit() {
      if (!isValid.value) return;

      if (currentStep.value === Step.step1) {
        preregister();
      } else if (currentStep.value === Step.step2) {
        register();
      }
    }

    onMounted(() => {
      const params = new URLSearchParams(window.location.search);
      const urlInviteCode = params.get('i');

      if (!urlInviteCode) return;
      if (!urlInviteCode.match(/[A-Za-z0-9]/)) return;
      inviteCode.value = urlInviteCode;
    });

    return {
      Step,
      ...errorStore,
      loading,
      currentStep,
      inviteCode,
      inviteCodeError,
      accountNumber,
      accountNumberError,
      email,
      emailError,
      password,
      passwordError,
      repeatPassword,
      isValid,
      resetError,
      handleSubmit,
    };
  },
});
</script>

<style lang="scss">
  @import "./scss/index.scss";

  .registration-card {
    width: 95vw;
    margin-top: 3em;
    padding: 3em;

    background-color: map.get($theme, primary, color);
    border-radius: 0.5rem;
    border: 1px solid colorStep(primary, $step: 3);

    h1 {
      line-height: 1.5;
      margin: 0 0 1em 0;
    }

    fieldset {
      border: none;
    }

    .fieldset {
      display: flex;
      flex-direction: column;
    }

    .fieldset + .fieldset {
      margin-top: 1.25em;
    }

    .buttons {
      margin-top: 3em;
      text-align: right;
    }

    @media (min-width: 800px) {
      width: 600px;
      box-shadow: 5px 10px 10px 0px rgba(30, 30, 30, 0.1);
    }
  }

  @media (min-width: 800px) {
    .registration-modal {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .modal__container {
        height: auto;
      }
    }
  }
</style>
