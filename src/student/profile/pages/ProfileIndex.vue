<script setup lang="ts">
import { toRef, ref, computed } from 'vue';

// Services
import { updateStudent } from '@/common/services/student';

// Composables
import useGlobalStore from '@/student/common/composables/useGlobalStore';

// Validation
import validateEmail from '@/common/validators/validateEmail';

// Components
import LoadingLabel from '@/common/components/LoadingLabel.vue';
import VInput from '@/common/components/inputs/VInput.vue';

const globalStore = useGlobalStore();
const accountNumber = toRef(() => globalStore.user.username.value);

const loading = ref(false);

const updateLabel = computed(() =>
  loading.value ? 'Loading...' : 'Update Profile'
);

const email = ref(globalStore.user.email.value);
const emailError = ref('');

async function handleSave() {
  if (emailError.value.length !== 0) {
    return;
  }

  loading.value = true;
  try {
    await updateStudent({
      id: globalStore.user.id.value,
      email: email.value,
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
</script>

<template>
  <div
    class="container section flow flex-group | card-wrapper"
    data-flex-type="center"
  >
    <div class="card flow">
      <h2 class="size-l">My Profile</h2>

      <form class="flow" @submit.prevent="handleSave">
        <v-input :model-value="accountNumber" label="Account Number" disabled />

        <v-input
          v-model="email"
          v-model:error="emailError"
          label="Email"
          help-text="Your email address can also be used as your username."
          :validator="validateEmail"
          required
        />

        <button
          type="submit"
          class="primary | width-100"
          data-button-type="chonky"
          :disabled="emailError.length !== 0"
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
