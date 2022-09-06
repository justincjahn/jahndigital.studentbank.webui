<script setup lang="ts">
import { defineAsyncComponent, ref, computed, watchEffect } from 'vue';

// Utils
import Money from '@/utils/money';

// Composables
import { buildFormData } from '@/modules/admin/stocks/composables/useStockForm';

// Components
import Modal from '@/components/Modal.vue';

const StockAddEditForm = defineAsyncComponent(() => import('@/modules/admin/stocks/components/forms/StockAddEditForm.vue'));

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  (event: 'ok', req: NewStockRequest): void
  (event: 'cancel'): void
}>();

const isValid = ref(false);
const shouldReset = ref(false);
const formData = buildFormData();

const canSubmit = computed(() => {
  if (props.loading) return false;
  return isValid.value;
});

function handleCancel() {
  shouldReset.value = true;
  emit('cancel');
}

function handleOk() {
  if (!canSubmit.value) return;

  const req: NewStockRequest = {
    symbol: formData.symbol,
    name: formData.name,
    rawDescription: formData.rawDescription,
    currentValue: Money.fromStringOrDefault(formData.currentValue).getAmount(),
  };

  emit('ok', req);
}

watchEffect(() => {
  if (props.show) {
    shouldReset.value = true;
  }
});
</script>

<template>
  <modal
    :show="show"
    class="large"
    title="New Stock"
    ok-label="Create"
    cancel-label="Cancel"
    :can-submit="canSubmit"
    :handle-enter="false"
    :can-cancel="!loading"
    :handle-escape="!loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <stock-add-edit-form
      v-model="formData"
      v-model:isValid="isValid"
      v-model:shouldReset="shouldReset"
    />
  </modal>
</template>
