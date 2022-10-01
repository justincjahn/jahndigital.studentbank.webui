<script lang="ts">
import { computed, useAttrs } from 'vue';

// Utils
import useUniqueId from '@/common/composables/useUniqueId';

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
    error: '',
    helpText: '',
    id: `input-${useUniqueId().toString()}`,
    label: '',
    required: false,
    validator: () => false,
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
  placeholder: attrs.placeholder ?? '0.0000',
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

// Normalize the value returned by the input into a percentage.
const normalize = (value: string): string => {
  if (!value || value.trim().length === 0) return '';
  return `${value.replaceAll('%', '')}%`;
};

// Remove the percentage from the modelValue for display in the box
const inputValue = computed(() => {
  if (!props.modelValue || props.modelValue.trim().length === 0) return '';

  const idx = props.modelValue.indexOf('%');
  if (idx >= 0) {
    return props.modelValue.substring(0, idx);
  }

  return props.modelValue;
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
    @update:model-value="(value: string | boolean) => $emit('update:modelValue', normalize(value.toString()))"
    @update:error="(value: string | false) => $emit('update:error', value)"
  >
    <template
      #default="{ attrs: inputAttrs, classes, id: inputId, inputName, update }"
    >
      <div class="rate-input">
        <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
        <input
          :id="inputId"
          :class="classes"
          :name="inputName"
          :value="inputValue"
          v-bind="inputAttrs"
          type="text"
          @keypress="handleKeypress($event)"
          @input="update(($event?.target as HTMLTextAreaElement).value)"
          @focus="($event?.target as HTMLInputElement)?.select()"
        />

        <span class="rate-input__percent">%</span>
      </div>
    </template>
  </v-input>
</template>

<style lang="scss">
.rate-input {
  display: inline-block;
  position: relative;

  input {
    width: 12ch;
    padding-right: 3ch !important;
  }

  &__percent {
    position: absolute;
    font-size: 0.9em;
    top: 0.35em;
    right: 1ch;
    user-select: none;
    color: #999;
  }
}
</style>
