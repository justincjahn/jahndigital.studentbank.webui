<template>
  <div class="change-password">
    <h2>Change Password</h2>
    <form
      ref="passwordForm"
      method="POST"
      @submit.prevent="submitPasswordChange"
    >
      <input
        type="hidden"
        name="username"
        autocomplete="username"
        readonly
        :value="username"
      />

      <base-input
        v-model="currentPassword"
        v-model:error="currentPasswordError"
        name="password"
        autocomplete="current-password"
        label="Current Password"
        type="password"
        required
        :validator="currentPasswordValidator"
      />

      <base-input
        v-model="password"
        v-model:error="passwordError"
        name="newPassword"
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
          <template v-if="loading">
            Loading...
          </template>
          <template v-else>
            Update Password
          </template>
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

// Utils
import { validatePassword } from '@/utils/validators';

// Services
import { updateStudent } from '@/services/student';

// Stores
import userStore from '@/stores/user';
import errorStore from '@/stores/error';

// Routes
import RouteNames from '../routeNames';

export default defineComponent({
  components: {
    BaseInput: defineAsyncComponent(() => import('@/components/BaseInput.vue')),
  },
  setup() {
    const router = useRouter();
    const loading = ref(false);
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

    // True if the password change form can be submitted
    const passwordChangeFormValid = computed(() => {
      if (loading.value) return false;
      if (currentPassword.value.length <= 0) return false;
      if (currentPassword.value === password.value) return false;
      if (passwordError.value.length > 0) return false;
      return true;
    });

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

        router.push({ name: RouteNames.index });
      } catch (e) {
        if (e instanceof Error) {
          errorStore.setCurrentError(e?.message ?? e);
        }
      } finally {
        loading.value = false;
      }
    }

    return {
      loading,
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
  .change-password {
    padding: 3rem;

    @media (min-width: 800px) {
      @include round-border;
      width: 35rem;
      margin: 2rem auto;
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
