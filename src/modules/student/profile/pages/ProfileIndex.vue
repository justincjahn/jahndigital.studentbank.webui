<template>
  <div class="student-profile">
    <h2>My Profile</h2>

    <form @submit.prevent="submitProfileUpdate">
      <base-input
        v-model="username"
        label="Account Number"
        disabled
      />

      <base-input
        v-model="emailAddress"
        v-model:error="emailAddressError"
        label="Email Address"
        required
        :validator="validateEmail"
      />

      <div class="buttons">
        <button
          type="submit"
          class="primary"
          :disabled="!profileFormValid"
        >
          Update Profile
        </button>
      </div>
    </form>
  </div>

  <div class="student-profile">
    <h2>Change Password</h2>
    <form
      ref="passwordForm"
      @submit.prevent="submitPasswordChange"
    >
      <input
        type="hidden"
        name="username"
        autocomplete="username"
        aria-label="username"
        readonly
        :value="username"
      />

      <base-input
        v-model="currentPassword"
        v-model:error="currentPasswordError"
        name="current-password"
        autocomplete="current-password"
        label="Current Password"
        type="password"
        required
        :validator="currentPasswordValidator"
      />

      <base-input
        v-model="password"
        v-model:error="passwordError"
        name="new-password"
        autocomplete="new-password"
        label="New Password"
        type="password"
        required
        :validator="samePasswordValidator"
      />

      <base-input
        v-model="repeatPassword"
        v-model:error="passwordError"
        name="repeat-password"
        autocomplete="repeat-password"
        label="Repeat Password"
        type="password"
        required
      />

      <div class="buttons">
        <button
          type="submit"
          class="primary"
          :disabled="!passwordChangeFormValid"
        >
          Update Password
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, ref, computed } from 'vue';

// Utils
import { validateEmail, validatePassword } from '@/utils/validators';

// Services
import { updateStudent } from '@/services/student';
import { info } from '@/services/auth';

// Stores
import userStore from '@/stores/user';
import errorStore from '@/stores/error';

export default defineComponent({
  components: {
    BaseInput: defineAsyncComponent(() => import('@/components/BaseInput.vue')),
  },
  setup() {
    const loading = ref(false);
    const emailAddress = ref(userStore.email.value);
    const emailAddressError = ref('');
    const passwordForm = ref<HTMLFormElement|null>(null);
    const currentPassword = ref('');
    const currentPasswordError = ref('');
    const repeatPassword = ref('');
    const password = ref('');
    const passwordError = ref('');
    const passwordValidator = validatePassword(repeatPassword);

    // Enrich error messages to tell users that their current and new passwords must differ
    const samePasswordValidator = (value: string) => {
      const isValid = passwordValidator(value);
      if (isValid !== true) return isValid;

      if (value === currentPassword.value) {
        return 'New password cannot be the same as your old password.';
      }

      return true;
    };

    // Ensure that the current password is specified
    const currentPasswordValidator = (value: string): boolean | string => {
      if (!value || value.trim().length === 0) {
        return 'Password is required.';
      }

      return true;
    };

    // True if the profile form can be submitted
    const profileFormValid = computed(() => {
      if (loading.value) return false;
      if (emailAddressError.value.length > 0) return false;

      if (emailAddress.value !== userStore.email.value) {
        return true;
      }

      return false;
    });

    // True if the password change form can be submitted
    const passwordChangeFormValid = computed(() => {
      if (loading.value) return false;
      if (currentPassword.value.length <= 0) return false;
      if (currentPassword.value === password.value) return false;
      if (passwordError.value.length > 0) return false;
      return true;
    });

    /**
     * Update the student's email address
     */
    async function submitProfileUpdate() {
      try {
        loading.value = true;

        await updateStudent({
          id: userStore.id.value,
          email: emailAddress.value,
        });

        await info();

        emailAddress.value = userStore.email.value;
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      } finally {
        loading.value = false;
      }
    }

    /**
     * Update the student's password.
     */
    async function submitPasswordChange() {
      if (!passwordForm.value) return;

      try {
        loading.value = true;

        await updateStudent({
          id: userStore.id.value,
          currentPassword: currentPassword.value,
          password: password.value,
        });

        passwordForm.value.reset();
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      } finally {
        loading.value = false;
      }
    }

    return {
      ...userStore,
      emailAddress,
      emailAddressError,
      validateEmail,
      submitProfileUpdate,
      profileFormValid,
      passwordForm,
      currentPassword,
      currentPasswordError,
      currentPasswordValidator,
      password,
      passwordError,
      repeatPassword,
      samePasswordValidator,
      submitPasswordChange,
      passwordChangeFormValid,
    };
  },
});
</script>

<style lang="scss">
  .student-profile {
    padding: 3rem;

    @media (min-width: 800px) {
      width: 35rem;
      margin: 2rem auto;
      border: 2px solid colorStep(secondary, $step: 2);
      border-radius: 0.5rem;
    }

    h2 {
      margin-bottom: 1em;
    }

    form {
      display: block;

      .buttons {
        margin-top: 0.5em;

        button {
          width: 100%;
          margin-right: 0;
          margin-left: 0;
        }
      }
    }
  }
</style>
