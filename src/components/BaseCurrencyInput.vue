<template>
  <div class="currency-input" :class="[$attrs.class, required ? 'required' : '']">
    <span class="currency-input__currency">$</span>

    <input
      :id="id"
      v-model="amount"
      type="text"
      :class="amountError.length > 0 ? 'error' : ''"
      :name="$attrs.name ?? 'amount'"
      :placeholder="$attrs.placeholder ?? '0.00'"
      :required="required"
      v-bind="$attrs"
      @focus="$event.target.select()"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, watch } from 'vue';

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
      if (typeof value !== 'string') return '0.00';
      return value;
    };

    const { value: amount, error: amountError } = useValidation(validationFunc, {
      decorator: normalize,
    });

    // When the input's value changes, pass the new value to the parent's v-model.
    watch(() => amount.value, (newAmount) => {
      if (typeof props.modelValue === 'undefined') return;
      emit('update:modelValue', normalize(newAmount));
    });

    // When the input's error changes, pass the new value to the parent's v-model.
    watch(() => amountError.value, (newError) => {
      if (typeof props.error === 'undefined') return;
      emit('update:error', newError);
    });

    // When the parent's v-model changes, update the input value
    watch(() => props.modelValue, (newValue) => {
      if (amount.value !== newValue) amount.value = newValue;
    }, { immediate: true });

    return {
      id,
      amount,
      amountError,
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
