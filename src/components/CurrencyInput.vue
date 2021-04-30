<template>
  <div class="currency-input" :class="$attrs.class">
    <span class="currency-input__currency">$</span>
    <input
      :id="$attrs.id ?? `currency-input--${id}`"
      v-model="amount"
      type="text"
      :name="$attrs.name ?? 'amount'"
      :placeholder="$attrs.placeholder ?? '0.00'"
      @focus="$event.target.select()"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType, computed, watch, onMounted } from 'vue';

// Utils
import uuid4 from '@/utils/uuid4';
import { validateAmount, validateAmountNonzero, validateAmountNotNegative } from '@/utils/validators';

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
    const id = uuid4();

    // Calculate what validation function(s) to use
    const validationFunc = computed(() => {
      if (props.validator) return props.validator;

      let func = validateAmount;
      if (!props.allowZero) {
        func = validateAmountNonzero;

        if (!props.allowNegative) {
          func = (value) => {
            const nz = validateAmountNonzero(value);
            if (nz !== true) return nz;
            return validateAmountNotNegative(value);
          };
        }
      } else if (!props.allowNegative) {
        func = validateAmountNotNegative;
      }

      return func;
    });

    /**
     * Normalize the value into a percentage.
     */
    const normalize = (value: string): string => {
      if (!value || value.trim().length === 0) return '0.00';
      return value;
    };

    const { value: amount, error: amountError } = useValidation(validationFunc, normalize);

    watch(() => amount.value, (newAmount) => {
      if (typeof props.modelValue === 'undefined') return;
      emit('update:modelValue', normalize(newAmount));
    });

    watch(() => amountError.value, (newError) => {
      if (typeof props.error === 'undefined') return;
      emit('update:error', newError);
    });

    // One-time sync of the modelValue to the validated method, everything else flows up
    onMounted(() => {
      amount.value = props.modelValue;
    });

    return {
      id,
      amount,
    };
  },
});
</script>

<style lang="scss">
.currency-input {
  display: inline-block;
  position: relative;

  input {
    padding-left: 3ch !important;
  }

  &__currency {
    position: absolute;
    font-size: 0.9em;
    top: .35em;
    left: 1ch;
    user-select: none;
    color: #999;
  }
}
</style>
