<template>
  <div class="rate-input" :class="[$attrs.class, required ? 'required' : '']">
    <input
      :id="id"
      v-model="rate"
      type="text"
      :class="rateError.length > 0 ? 'error' : ''"
      :name="$attrs.name ?? 'amount'"
      :placeholder="$attrs.placeholder ?? '0.0000'"
      :required="required"
      v-bind="$attrs"
      @focus="$event.target.select()"
    />

    <span class="rate-input__percent">%</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, watch, computed } from 'vue';

// Utils
import uuid4 from '@/utils/uuid4';
import { validateRate, validateRateNonzero, validateRateNotNegative } from '@/utils/validators';

// Composables
import useValidation from '@/composables/useValidation';

export default defineComponent({
  inheritAttrs: false,
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    error: {
      type: String,
      required: true,
    },
    allowNegative: {
      type: Boolean,
      default: true,
    },
    allowZero: {
      type: Boolean,
      default: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    validator: {
      type: Function as PropType<(value: string) => string|boolean>,
      default: undefined,
    },
  },
  emits: [
    'update:modelValue',
    'update:error',
  ],
  setup(props, { emit, attrs }) {
    const uuid = uuid4();

    // Unique identifier for this particular input box
    const id = computed(() => {
      if (attrs.id) return attrs.id as string;
      return `currency-input--${uuid}`;
    });

    // Calculate what validation function(s) to use
    const validationFunc = computed(() => {
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

    /**
     * Normalize the value into a percentage.
     */
    const normalize = (value: string): string => {
      if (!value || value.trim().length === 0) return '0.0%';
      if (value.indexOf('%') === -1) return `${value}%`;
      return value;
    };

    /**
     * Denormalize the value into a string without a percentage.
     */
    const denormalize = (value: string): string => {
      if (!value || value.trim().length === 0) return '';
      const idx = value.lastIndexOf('%');

      if (idx >= 0) {
        return value.substring(0, idx);
      }

      return value;
    };

    const { value: rate, error: rateError } = useValidation(validationFunc, {
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

    return {
      id,
      rate,
      rateError,
    };
  },
});
</script>

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
