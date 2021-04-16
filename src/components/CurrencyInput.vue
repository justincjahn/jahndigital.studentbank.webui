<template>
  <div class="currency-input__amount-wrapper" :class="$attrs.class">
    <span class="currency-input__amount-wrapper__currency">$</span>
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
import { defineComponent, watch, onMounted } from 'vue';

// Utils
import uuid4 from '@/utils/uuid4';
import { validateAmount, validateAmountNonzero, validateAmountNotNegative } from '@/utils/validators';

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
  },
  emits: [
    'update:modelValue',
    'update:error',
  ],
  setup(props, { emit }) {
    const id = uuid4();

    // Calculate what validation function(s) to use
    let validationFunc = validateAmount;
    if (!props.allowZero) {
      validationFunc = validateAmountNonzero;

      if (!props.allowNegative) {
        validationFunc = (value) => {
          const nz = validateAmountNonzero(value);
          if (nz !== true) return nz;
          return validateAmountNotNegative(value);
        };
      }
    } else if (!props.allowNegative) {
      validationFunc = validateAmountNotNegative;
    }

    const { value: amount, error: amountError } = useValidation(validationFunc);

    watch(() => amount.value, (newAmount) => {
      // Sometimes this watch fires after the component has been unmounted
      if (typeof props.modelValue === 'undefined') return;
      emit('update:modelValue', newAmount);
    });

    watch(() => amountError.value, (newError) => {
      // Sometimes this watch fires after the component has been unmounted
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
  &__amount-wrapper {
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
}
</style>
