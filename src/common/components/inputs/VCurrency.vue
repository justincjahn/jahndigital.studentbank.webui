<script lang="ts">
import { useAttrs, computed } from 'vue';

// Validators
import validateAmount from '@/common/validators/validateAmount';
import validateAmountNonzero from '@/common/validators/validateAmountNonzero';
import validateAmountNonnegative from '@/common/validators/validateAmountNonnegative';

// Components
import VInput from './VInput.vue';

// Types
import type { ValidationFunc } from './types';

export default {
  inheritAttrs: false,
};
</script>

<script lang="ts" setup>
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
    helpText: undefined,
    id: undefined,
    label: undefined,
    required: undefined,
    validator: undefined,
  }
);

defineEmits<{
  (event: 'update:modelValue', value: string | boolean): void;
  (event: 'update:error', error: string | false): void;
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
  placeholder: (attrs.placeholder as string) ?? '0.00',
  ...attrs,
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

const normalize = (value: string): string => {
  if (typeof value !== 'string') return '0.00';
  return value;
};
</script>

<template>
  <v-input
    v-bind="inputProps"
    :validator="validator"
    :placeholder="inputProps.placeholder"
    @update:model-value="(value: string | boolean) => $emit('update:modelValue', normalize(value.toString()))"
    @update:error="(value: string | false) => $emit('update:error', value)"
  >
    <template
      #default="{
        attrs: inputAttrs,
        classes,
        id: inputId,
        inputName,
        modelValue: val,
        required: isReq,
        update,
      }"
    >
      <div class="currency-input">
        <span class="currency-input__currency">$</span>

        <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
        <input
          :id="inputId"
          :class="classes"
          :name="inputName"
          :required="isReq"
          :value="val"
          v-bind="inputAttrs"
          type="text"
          @input="update(($event?.target as HTMLInputElement).value)"
          @focus="($event?.target as HTMLInputElement).select()"
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

.currency-input input {
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
