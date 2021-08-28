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
          <template v-if="loading">
            Loading...
          </template>
          <template v-else>
            Update Profile
          </template>
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, ref, computed } from 'vue';

// Utils
import { validateEmail } from '@/utils/validators';

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

    // True if the profile form can be submitted
    const profileFormValid = computed(() => {
      if (loading.value) return false;
      if (emailAddressError.value.length > 0) return false;

      if (emailAddress.value !== userStore.email.value) {
        return true;
      }

      return false;
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

    return {
      ...userStore,
      loading,
      emailAddress,
      emailAddressError,
      validateEmail,
      submitProfileUpdate,
      profileFormValid,
    };
  },
});
</script>

<style lang="scss">
  .student-profile {
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
