<template>
  <div class="rate-input__percent-wrapper">
    <input
      :id="$attrs.id ?? id"
      v-model="rate"
      type="text"
      :name="$attrs.name ?? 'amount'"
      :placeholder="$attrs.placeholder ?? '0.0000'"
      @focus="$event.target.select()"
    />
    <span class="rate-input__percent-wrapper__percent">%</span>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType, watch, onMounted, computed } from 'vue';

// Utils
import uuid4 from '@/utils/uuid4';
import { validateRate, validateRateNonzero, validateRateNotNegative } from '@/utils/validators';

// Composables
import useValidation from '@/composables/useValidation';

export default defineComponent({
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
    validator: {
      type: Function as PropType<(value: string) => string|boolean>,
      default: undefined,
    },
  },
  emits: [
    'update:modelValue',
    'update:error',
  ],
  setup(props, { emit }) {
    // Unique identifier for this particular input box
    const id = `currency-input--${uuid4()}`;

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

    const { value: rate, error: rateError } = useValidation(validationFunc, normalize);

    watch(() => rate.value, (newRate) => {
      if (typeof props.modelValue === 'undefined') return;
      emit('update:modelValue', normalize(newRate));
    });

    watch(() => rateError.value, (newError) => {
      if (typeof props.error === 'undefined') return;
      emit('update:error', newError);
    });

    onMounted(() => {
      if (typeof props.modelValue === 'undefined') return;
      rate.value = denormalize(props.modelValue);
    });

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
  &__percent-wrapper {
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
}
</style>
