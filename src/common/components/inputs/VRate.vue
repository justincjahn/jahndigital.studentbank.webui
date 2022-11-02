<script lang="ts">
import { ref, computed, useAttrs, watch } from 'vue';

import type { IRate } from '@/common/utils/Rate';
import Rate from '@/common/utils/Rate';

import validateRate from '@/common/validators/validateRate';
import validateRateNonzero from '@/common/validators/validateRateNonzero';
import validateRateNonnegative from '@/common/validators/validateRateNonnegative';
import type { ValidationFunc } from './types';

import VInput from './VInput.vue';

export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: IRate;
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
    helpText: 'Enter a rate as a decimal or percentage.  E.g. 0.01 or 10%.',
    id: undefined,
    label: undefined,
    required: undefined,
    validator: undefined,
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: IRate): void;
  (event: 'update:error', value: string): void;
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

const input = ref('0.0000');

// Because we support modifiers (%), store the rate that was last sent to the parent
/// allowing a comparison to see if the parent initiated a model change, or we did.
let lastModelUpdate: IRate = Rate.fromNumber(0);

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
  placeholder: (attrs.placeholder as string) ?? '0.0000',
}));

const validator = computed(() => {
  if (props.validator) return props.validator;

  let func = validateRate;
  if (!props.allowZero) {
    func = validateRateNonzero;

    if (!props.allowNegative) {
      func = (value) => {
        const nz = validateRateNonzero(value);
        if (nz !== true) return nz;
        return validateRateNonnegative(value);
      };
    }
  } else if (!props.allowNegative) {
    func = validateRateNonnegative;
  }

  return func;
});

function handleKeypress(e: KeyboardEvent) {
  const SupportedCharactersRegex = /[0-9.%-]/;

  if (['Enter', 'Escape', 'Tab'].includes(e.key)) {
    return;
  }

  if (!SupportedCharactersRegex.test(e.key)) {
    e.preventDefault();
  }

  const { value } = e.target as HTMLInputElement;

  if (value === '' && ['.', '%'].includes(e.key)) {
    e.preventDefault();
  }

  if (e.key === '%' && value.indexOf('%') > -1) {
    e.preventDefault();
  }

  if (e.key === '.' && value.indexOf('.') > -1) {
    e.preventDefault();
  }
}

function handleInput(value: string | boolean) {
  input.value = value.toString();
  lastModelUpdate = Rate.fromStringOrDefault(input.value);
  emit('update:modelValue', lastModelUpdate);
}

watch(
  () => props.modelValue,

  (newValue) => {
    if (newValue.getRate() === lastModelUpdate.getRate()) {
      return;
    }

    lastModelUpdate = newValue;
    input.value = newValue.getRate().toFixed(4);
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
    @update:model-value="handleInput"
    @update:error="(value) => (error = value)"
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
      <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
      <input
        :id="inputId"
        :class="classes"
        :name="inputName"
        :value="val"
        v-bind="inputAttrs"
        type="text"
        @keypress="handleKeypress"
        @input="update"
        @focus="($event.target as HTMLInputElement).select()"
      />
    </template>
  </v-input>
</template>
