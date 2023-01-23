<script lang="ts" setup>
import type { GlobalStore } from '@/admin/common/stores/global';
import { defineAsyncComponent, ref, computed, watchEffect } from 'vue';

import LoadingLabel from '@/common/components/LoadingLabel.vue';

import {
  StudentAddEditForm,
  buildFormData,
  resetFormData,
} from '@/admin/common/components/StudentAddEditForm';

const props = defineProps<{
  show: boolean;
  store: GlobalStore;
}>();

defineEmits<{
  (event: 'cancel'): void;
}>();

const ModalDialog = defineAsyncComponent(
  () => import('@/common/components/ModalDialog.vue')
);

const formData = buildFormData();
const valid = ref(false);
const loading = ref(false);

const isLoading = computed(() => loading.value);

const instanceId = computed(
  () => props.store.instance.selected.value?.id ?? -1
);

watchEffect(() => {
  if (props.show) {
    resetFormData(formData);
  }
});
</script>

<template>
  <modal-dialog
    title="New Student"
    class="large"
    :show="props.show"
    :can-submit="valid"
    cancel-label="Cancel"
    @cancel="$emit('cancel')"
  >
    <template #submitLabel="{ label }">
      <loading-label :show="isLoading">{{ label }}</loading-label>
    </template>

    <form class="saef" @submit.prevent>
      <student-add-edit-form
        v-model="formData"
        v-model:valid="valid"
        v-model:loading="loading"
        :instance-id="instanceId"
      />
    </form>
  </modal-dialog>
</template>
