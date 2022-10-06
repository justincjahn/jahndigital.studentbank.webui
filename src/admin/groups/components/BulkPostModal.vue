<script lang="ts" setup>
import { defineAsyncComponent, computed, watchEffect } from 'vue';

// Services
import selection from '@/admin/groups/services/StudentSelectionService';

// Stores
import { setup as setupBulkPostStore } from '@/admin/groups/stores/bulkPost';

// Components
import LoadingLabel from '@/common/components/LoadingLabel.vue';

const ModalDialog = defineAsyncComponent(
  () => import('@/common/components/ModalDialog.vue')
);

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (event: 'ok'): void;
  (event: 'cancel'): void;
}>();

const bulkPostStore = setupBulkPostStore(selection);

const loading = computed(() => bulkPostStore.loading.value);

const isValid = computed(() => bulkPostStore.isValid.value);

const errors = computed(
  () => bulkPostStore.errors.value[bulkPostStore.currentStep.value] ?? []
);

const modalOkLabel = computed(() => {
  if (loading.value) return 'Loading...';
  if (bulkPostStore.hasNextStep.value) return 'Next';
  return 'Post';
});

const canSubmit = computed(
  () => bulkPostStore.isValid.value === true && !loading.value
);

function handleOk() {
  if (!bulkPostStore.isValid.value) {
    return;
  }

  if (bulkPostStore.hasNextStep.value) {
    bulkPostStore.incrementStep();
    return;
  }

  emit('ok');
}

function handleCancel() {
  emit('cancel');
}

watchEffect(() => {
  if (props.show) {
    bulkPostStore.fetchStudents();
  }
});
</script>

<template>
  <modal-dialog
    title="Bulk Transaction"
    cancel-label="Cancel"
    class="large"
    :show="props.show"
    :ok-label="modalOkLabel"
    :can-submit="canSubmit"
    :can-cancel="!loading"
    :handle-enter="canSubmit"
    :handle-escape="!loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <template #okLabel="{ okLabel }">
      <loading-label :show="loading">
        {{ okLabel }}
      </loading-label>
    </template>

    <p v-if="isValid !== true" class="error">
      {{ isValid }}
    </p>

    <ul v-if="errors.length > 0">
      <li v-for="(error, idx) in errors" :key="idx">
        {{ error }}
      </li>
    </ul>
  </modal-dialog>
</template>
