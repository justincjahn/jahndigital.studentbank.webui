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

const {
  loading,
  isValid,
  currentErrors,
  currentStep,
  incrementStep,
  decrementStep,
} = bulkPostStore;

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

    <form @submit.prevent>
      <div v-if="currentStep == 1">
        <h2>Step 1: Select a Share Type</h2>
      </div>
    </form>
  </modal-dialog>
</template>
