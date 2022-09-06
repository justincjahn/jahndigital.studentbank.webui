<script setup lang="ts">
import { defineAsyncComponent, PropType, watch, watchEffect } from 'vue';

// Utils
import uuid4 from '@/utils/uuid4';
import { validateStockName, validateStockSymbol } from '@/utils/validators';

// Composables
import useStockForm, { StockDTO } from '@/modules/admin/stocks/composables/useStockForm';

// Components
const BaseInput = defineAsyncComponent(() => import('@/components/BaseInput.vue'));
const CurrencyInput = defineAsyncComponent(() => import('@/components/CurrencyInput.vue'));
const BaseTextarea = defineAsyncComponent(() => import('@/components/BaseTextarea.vue'));

const props = defineProps({
  stock: {
    type: Object as PropType<Stock|null>,
    default: null,
  },
  modelValue: {
    type: Object as PropType<StockDTO>,
    required: true,
  },
  isValid: {
    type: Boolean,
    default: false,
  },
  shouldReset: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'update:modelValue',
  'update:isValid',
  'update:shouldReset',
]);

const id = uuid4();
const { data, errors, isValid, reset } = useStockForm(props.modelValue);

watch(() => isValid.value, () => {
  emit('update:isValid', isValid.value);
}, { immediate: true });

watch(() => props.shouldReset, () => {
  if (!props.shouldReset) return;
  reset(props.stock ?? undefined);
  emit('update:shouldReset', false);
});

watchEffect(() => {
  if (props.stock) {
    reset(props.stock);
  }
});
</script>

<template>
  <suspense>
    <template #default>
      <div class="sae-form">
        <base-input
          :id="`sae-form__symbol--${id}`"
          v-model="data.symbol"
          v-model:error="errors.symbol"
          label="Symbol"
          required
          :validator="validateStockSymbol"
        />

        <base-input
          :id="`sae-form__name--${id}`"
          v-model="data.name"
          v-model:error="errors.name"
          label="Name"
          required
          :validator="validateStockName"
        />

        <currency-input
          :id="`sae-form__currentValue--${id}`"
          v-model="data.currentValue"
          v-model:error="errors.currentValue"
          label="Current Value"
          :allow-negative="false"
          :allow-zero="true"
        />

        <base-textarea
          :id="`sae-form__rawDescription--${id}`"
          v-model="data.rawDescription"
          label="Description"
        >
          <template #help="{ className }">
            <p :class="className">
              <a target="_blank" href="https://github.github.com/gfm/">GitHub Flavored Markdown</a> is supported.
            </p>
          </template>
        </base-textarea>
      </div>
    </template>
    <template #fallback>
      Loading...
    </template>
  </suspense>
</template>
