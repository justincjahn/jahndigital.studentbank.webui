<script lang="ts">
import { ref, computed, useAttrs, watch } from 'vue';

import type { IMoney } from '@/common/utils/Money';
import Money from '@/common/utils/Money';

import validateAmount from '@/common/validators/validateAmount';
import validateAmountNonzero from '@/common/validators/validateAmountNonzero';
import validateAmountNonnegative from '@/common/validators/validateAmountNonnegative';
import type { ValidationFunc } from './types';

import VInput from './VInput.vue';

export default {
  inheritAttrs: false,
};
</script>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    modelValue: IMoney;
    name?: string;
    error?: string;
    allowNegative?: boolean;
    allowZero?: boolean;
    helpText?: string;
    id?: string;
    label?: string;
    required?: boolean;
    validator?: ValidationFunc;
  }>(),
  {
    allowNegative: true,
    allowZero: true,
    name: undefined,
    error: undefined,
    helpText: undefined,
    id: undefined,
    label: undefined,
    required: undefined,
    validator: undefined,
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: IMoney): void;
  (event: 'update:error', error: string): void;
}>();

const attrs = useAttrs();

const internalError = ref('');

const error = computed({
  get() {
    return typeof props.error !== 'undefined'
      ? props.error
      : internalError.value;
  },

  set(value) {
    if (typeof props.error !== 'undefined') {
      emit('update:error', value);
    } else {
      internalError.value = value;
    }
  },
});

const input = ref('0.00');
let lastModelUpdate: IMoney = Money.fromNumber(0);

// Remove this component's props from what's passed down to the VInput component
const inputProps = computed(() => ({
  ...attrs,
  name: props.name,
  modelValue: input.value,
  error: error.value,
  helpText: props.helpText,
  id: props.id,
  label: props.label,
  required: props.required,
  placeholder: (attrs.placeholder as string) ?? '0.00',
}));

const validator = computed(() => {
  if (props.validator) return props.validator;

  let func = validateAmount;
  if (!props.allowZero) {
    func = validateAmountNonzero;

    if (!props.allowNegative) {
      func = (value) => {
        const nz = validateAmountNonzero(value);
        if (nz !== true) return nz;
        return validateAmountNonnegative(value);
      };
    }
  } else if (!props.allowNegative) {
    func = validateAmountNonnegative;
  }

  return func;
});

function handleInput(value: string | boolean) {
  input.value = value.toString();
  lastModelUpdate = Money.fromStringOrDefault(input.value);
  emit('update:modelValue', lastModelUpdate);
}

watch(
  () => props.modelValue,

  (newValue) => {
    if (newValue.getAmount() === lastModelUpdate.getAmount()) {
      return;
    }

    lastModelUpdate = newValue;
    input.value = newValue.getAmount().toFixed(2);
  },

  {
    immediate: true,
  }
);
</script>

<template>
  <v-input
    v-bind="inputProps"
    :validator="validator"
    :placeholder="inputProps.placeholder"
    @update:model-value="handleInput"
    @update:error="(value: string) => (error = value)"
  >
    <template v-for="slotName in Object.keys($slots)" #[slotName]="slotData">
      <slot :name="slotName" v-bind="slotData" />
    </template>

    <template
      #default="{
        modelValue: val,
        attrs: inputAttrs,
        classes,
        id: inputId,
        inputName,
        update,
      }"
    >
      <div class="currency-input">
        <span class="currency-input__currency">$</span>

        <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
        <input
          :id="inputId"
          :class="[classes, 'current-input__input']"
          :name="inputName"
          :value="val"
          v-bind="inputAttrs"
          type="text"
          @input="update"
          @focus="($event.target as HTMLInputElement).select()"
        />
      </div>
    </template>
  </v-input>
</template>

<style>
.currency-input {
  display: inline-block;
  position: relative;
}

.currency-input .current-input__input {
  padding-left: 3ch;
}

.currency-input__currency {
  position: absolute;
  font-size: 0.9em;
  top: 0.35em;
  left: 1ch;
  user-select: none;
  color: #999;
}
</style>
