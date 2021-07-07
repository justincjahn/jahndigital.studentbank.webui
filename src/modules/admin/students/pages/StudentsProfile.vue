<template>
  <div class="student-info">
    <form @submit.prevent="updateStudent">
      <h2>Account Info</h2>

      <base-input
        v-model="data.student.accountNumber"
        v-model:error="data.errors.accountNumber"
        label="Account Number"
        :validator="validateAccount"
      />

      <base-input
        v-model="data.student.email"
        v-model:error="data.errors.email"
        label="Email"
        :validator="validateEmail"
      />

      <base-input
        v-model="data.student.firstName"
        v-model:error="data.errors.firstName"
        label="First Name"
        :validator="validateName"
      />

      <base-input
        v-model="data.student.lastName"
        v-model:error="data.errors.lastName"
        label="Last Name"
        :validator="validateName"
      />

      <div class="fieldset">
        <button
          type="submit"
          class="primary"
          :disabled="!isInfoValid || loading"
        >
          Save
        </button>
      </div>
    </form>
  </div>

  <div class="student-info">
    <form @submit.prevent="updatePasssword">
      <h2>Change Password</h2>

      <base-input
        v-model="data.password.new"
        v-model:error="data.errors.password"
        type="password"
        label="New Password"
        aria-autocomplete="none"
        autocomplete="none"
        required
        :validator="passwordValidator"
      />

      <base-input
        v-model="data.password.repeat"
        v-model:error="data.errors.password"
        type="password"
        label="Repeat Password"
        aria-autocomplete="none"
        autocomplete="none"
        required
      />

      <div class="fieldset">
        <button
          type="submit"
          class="primary"
          :disabled="!isPasswordValid || loading"
        >
          Change
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, ref, toRef, reactive, computed, watch } from 'vue';

// Utils
import injectStrict from '@/utils/injectStrict';
import { validateAccountUnique, validateEmail, validateName, validatePassword } from '@/utils/validators';

// Symbols
import { GLOBAL_STORE } from '../../symbols';

export default defineComponent({
  components: {
    BaseInput: defineAsyncComponent(() => import('@/components/BaseInput.vue')),
  },
  setup() {
    const globalStore = injectStrict(GLOBAL_STORE);
    const loading = ref(false);
    const validateAccount = validateAccountUnique({ studentStore: globalStore.student });

    const data = reactive({
      student: {
        id: -1,
        accountNumber: '',
        email: '',
        firstName: '',
        lastName: '',
      } as Student,
      password: {
        new: '',
        repeat: '',
      },
      errors: {
        accountNumber: '',
        email: '',
        firstName: '',
        lastName: '',
        password: '',
      },
    });

    const passwordValidator = validatePassword(toRef(data.password, 'repeat'));

    const isInfoValid = computed(() => {
      if (Object.values(data.errors).every((x) => x.length === 0)) return true;
      return false;
    });

    const isPasswordValid = computed(() => {
      if (data.errors.password) return false;
      return true;
    });

    async function updateStudent() {
      try {
        loading.value = true;
        const res = await globalStore.student.updateStudent({
          ...data.student,
          accountNumber: data.student.accountNumber.padStart(10, '0'),
        });
        if (res[0]) {
          [globalStore.student.selected.value] = res;
        }
      } catch (e) {
        globalStore.error.setCurrentError(e?.message ?? e);
      } finally {
        loading.value = false;
      }
    }

    async function updatePasssword() {
      try {
        loading.value = true;
        await globalStore.student.updatePassword(data.student.id, data.password.repeat);
        data.password.new = '';
        data.password.repeat = '';
      } catch (e) {
        globalStore.error.setCurrentError(e?.message ?? e);
      } finally {
        loading.value = false;
      }
    }

    watch(() => globalStore.student.selected.value, (newValue, oldValue) => {
      if (!newValue) return;

      if (oldValue !== newValue) {
        data.student = {
          ...newValue,
        };
      }
    }, { immediate: true });

    return {
      data,
      loading,
      isInfoValid,
      isPasswordValid,
      updateStudent,
      updatePasssword,
      validateAccount,
      validateEmail,
      validateName,
      passwordValidator,
    };
  },
});
</script>

<style lang="scss">
.student-info {
  @include round-border;
  margin: 0px auto;
  padding: 2em;
  width: 30em;
  background-color: colorStep(secondary);

  button {
    width: 100%;
  }

  h2 {
    margin-bottom: 1em;
  }

  & + & {
    margin-top: 2em;
  }
}
</style>
