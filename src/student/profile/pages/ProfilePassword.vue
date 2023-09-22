<script setup lang="ts">
import { ref, computed, reactive, watchEffect } from 'vue';

// Services
import { updateStudent } from '@/common/services/student';

// Composables
import useGlobalStore from '@/student/common/composables/useGlobalStore';

// Validation
import validatePassword from '@/common/validators/validatePassword';

// Components
import LoadingLabel from '@/common/components/LoadingLabel.vue';
import VInput from '@/common/components/inputs/VInput.vue';

const globalStore = useGlobalStore();

const loading = ref(false);

const updateLabel = computed(() =>
  loading.value ? 'Loading...' : 'Change Password'
);

const data = reactive({
  data: {
    currentPassword: '',
    password: '',
    passwordRepeat: '',
  },

  errors: {
    currentPassword: '',
    password: '',
    passwordRepeat: '',
  },
});

const isPasswordValid = computed(
  () =>
    Object.values({ ...data.errors }).every((x) => x.length === 0) &&
    data.data.password.length > 0 &&
    data.data.currentPassword.length > 0
);

async function handleSave() {
  if (!isPasswordValid.value) {
    return;
  }

  loading.value = true;

  try {
    await updateStudent({
      id: globalStore.user.id.value,
      currentPassword: data.data.currentPassword,
      password: data.data.password,
    });

    await globalStore.user.logout();
    window.location.reload();
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
    data.errors.passwordRepeat = 'Passwords do not match.';
  } else {
    data.errors.passwordRepeat = '';
  }
});
</script>

<template>
  <div
    class="container section flow flex-group | card-wrapper"
    data-flex-type="center"
  >
    <div class="card flow">
      <h2 class="size-l">My Profile</h2>

      <form class="flow" @submit.prevent="handleSave">
        <v-input
          v-model="data.data.currentPassword"
          v-model:error="data.errors.currentPassword"
          type="password"
          name="current-password"
          label="Current Password"
          required
        />

        <v-input
          v-model="data.data.password"
          v-model:error="data.errors.password"
          type="password"
          name="new-password"
          label="Password"
          :validator="validatePassword()"
          required
        />

        <v-input
          v-model="data.data.passwordRepeat"
          v-model:error="data.errors.passwordRepeat"
          type="password"
          name="repeat-password"
          label="Repeat Password"
          required
        />

        <button
          type="submit"
          class="primary | width-100"
          data-button-type="chonky"
          :disabled="!isPasswordValid"
        >
          <loading-label :show="loading">{{ updateLabel }}</loading-label>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.card-wrapper {
  --card-width: 30rem;
}
</style>
