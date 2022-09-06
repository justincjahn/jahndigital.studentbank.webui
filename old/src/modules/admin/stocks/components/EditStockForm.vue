<script setup lang="ts">
import { ref, computed, watch } from 'vue';

// Utils
import Money from '@/utils/money';

// Composables
import { buildFormData } from '@/modules/admin/stocks/composables/useStockForm';

// Components
import StockAddEditForm from '@/modules/admin/stocks/components/forms/StockAddEditForm.vue';

const props = withDefaults(
  defineProps<{
    selected: Stock|null
    loading: boolean
  }>(),

  {
    selected: null,
  },
);

const emit = defineEmits<{
  (event: 'submit', req: UpdateStockRequest): void
}>();

const isValid = ref(false);
const shouldReset = ref(false);
const formData = buildFormData();

const canSubmit = computed(() => isValid.value);

function handleSubmit() {
  if (!canSubmit.value) return;
  if (!props.selected) return;

  const res: UpdateStockRequest = {
    id: props.selected.id,
    name: formData.name,
    symbol: formData.symbol,
    currentValue: Money.fromStringOrDefault(formData.currentValue).getAmount(),
    rawDescription: formData.rawDescription,
  };

  emit('submit', res);
}

watch(() => props.selected, (newStock: Stock|null, oldStock: Stock|null) => {
  if (newStock === oldStock) return;
  shouldReset.value = true;
});
</script>

<template>
  <form class="edit-stock-form" @submit.prevent="handleSubmit">
    <stock-add-edit-form
      v-model="formData"
      v-model:isValid="isValid"
      v-model:shouldReset="shouldReset"
      :stock="selected"
    />

    <slot
      name="buttons"
      :can-submit="canSubmit"
    >
      <div class="edit-stock-form--buttons">
        <button
          type="submit"
          class="primary"
          :disabled="!canSubmit"
        >
          Update
        </button>
      </div>
    </slot>
  </form>
</template>

<style lang="scss">
  .edit-stock-form {
    &--buttons {
      margin-top: 1rem;
      text-align: right;
    }
  }
</style>
