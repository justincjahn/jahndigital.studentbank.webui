<script lang="ts">
import { validationFunc } from '@/types';
import { watch, computed, useAttrs } from 'vue';

// Utils
import uuid4 from '@/utils/uuid4';
import { validateRate, validateRateNonzero, validateRateNotNegative } from '@/utils/validators';

// Composables
import useValidation from '@/composables/useValidation';

export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  error?: string
  allowNegative?: boolean
  allowZero?: boolean
  required?: boolean
  validator?: validationFunc
}>(), {
  modelValue: '0.00',
  error: '',
  allowNegative: false,
  allowZero: true,
  required: false,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'update:error', value: string): void
}>();

const attrs = useAttrs();

const uuid = uuid4();

const id = computed(() => {
  if (attrs.id) return attrs.id as string;
  return `currency-input--${uuid}`;
});

// Calculate what validation function(s) to use
const validator = computed(() => {
  if (props.validator) return props.validator;

  let func = validateRate;
  if (!props.allowZero) {
    func = validateRateNonzero;

    if (!props.allowNegative) {
      func = (value) => {
        const nz = validateRateNonzero(value);
        if (nz !== true) return nz;
        return validateRateNotNegative(value);
      };
    }
  } else if (!props.allowNegative) {
    func = validateRateNotNegative;
  }

  return func;
});

// Normalize the value into a percentage.
const normalize = (value: string): string => {
  if (!value || value.trim().length === 0) return '';
  if (value.indexOf('%') === -1) return `${value}%`;
  return value;
};

// Denormalize the value into a string without a percentage.
const denormalize = (value: string): string => {
  if (!value || value.trim().length === 0) return '';
  const idx = value.lastIndexOf('%');

  if (idx >= 0) {
    return value.substring(0, idx);
  }

  return value;
};

const { value: rate, error: rateError } = useValidation(validator, {
  decorator: normalize,
});

// When the input's value changes, pass the new value to the parent's v-model.
watch(() => rate.value, (newRate) => {
  if (typeof props.modelValue === 'undefined') return;
  emit('update:modelValue', normalize(newRate));
});

// When the input's error changes, pass the new value to the parent's v-model.
watch(() => rateError.value, (newError) => {
  if (typeof props.error === 'undefined') return;
  emit('update:error', newError);
});

// When the parent's v-model changes, update the input value
watch(() => props.modelValue, (newValue) => {
  if (rate.value !== newValue) rate.value = denormalize(newValue);
}, { immediate: true });
</script>

<template>
  <div class="rate-input" :class="[$attrs.class, required ? 'required' : '']">
    <input
      :id="id"
      v-model="rate"
      type="text"
      :class="rateError.length > 0 ? 'error' : ''"
      :name="($attrs.name as string) ?? 'amount'"
      :placeholder="($attrs.placeholder as string) ?? '0.0000'"
      :required="required"
      v-bind="$attrs"
      @focus="($event?.target as HTMLInputElement)?.select()"
    />

    <span class="rate-input__percent">%</span>
  </div>
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
    top: .35em;
    right: 1ch;
    user-select: none;
    color: #999;
  }
}
</style>
