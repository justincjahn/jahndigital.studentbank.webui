<script lang="ts">
import { computed, useAttrs } from 'vue';

import validateRate from '@/common/validators/validateRate';
import validateRateNonzero from '@/common/validators/validateRateNonzero';
import validateRateNonnegative from '@/common/validators/validateRateNonnegative';

// Components
import VInput from './VInput.vue';

// Types
import type { ValidationFunc } from './types';

export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name: string;
    modelValue: string;
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
    error: undefined,
    helpText: 'Enter a rate as a decimal or percentage.  E.g., 0.01 or 10%.',
    id: undefined,
    label: undefined,
    required: undefined,
    validator: undefined,
  }
);

defineEmits<{
  (event: 'update:modelValue', value: string): void;
  (event: 'update:error', value: string): void;
}>();

const attrs = useAttrs();

// Remove this component's props from what's passed down to the VInput component
const inputProps = computed(() => ({
  name: props.name,
  modelValue: props.modelValue,
  error: props.error,
  helpText: props.helpText,
  id: props.id,
  label: props.label,
  required: props.required,
  placeholder: (attrs.placeholder as string) ?? '0.0000',
  ...attrs,
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
</script>

<template>
  <v-input
    v-bind="inputProps"
    :validator="validator"
    @update:model-value="(value: string | boolean) => $emit('update:modelValue', value.toString())"
    @update:error="(value: string | false) => $emit('update:error', value)"
  >
    <template
      #default="{ attrs: inputAttrs, classes, id: inputId, inputName, update }"
    >
      <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
      <input
        :id="inputId"
        :class="classes"
        :name="inputName"
        :value="modelValue"
        v-bind="inputAttrs"
        type="text"
        @keypress="handleKeypress($event)"
        @input="update(($event?.target as HTMLTextAreaElement).value)"
        @focus="($event?.target as HTMLInputElement)?.select()"
      />
    </template>
  </v-input>
</template>
