<template>
  <form class="edit-stock-form" @submit.prevent="handleSubmit">
    <base-input
      v-model="name"
      v-model:error="nameError"
      label="Name"
      name="name"
      required
      :validator="validateStockName"
    />

    <base-input
      v-model="symbol"
      v-model:error="symbolError"
      label="Symbol"
      name="symbol"
      required
      :validator="validateStockSymbol"
    />

    <base-input
      v-model="rawDescription"
      label="Description"
      name="description"
    />

    <currency-input
      v-model="amount"
      v-model:error="amountError"
      label="New Value"
      required
      :allow-negative="false"
    />

    <slot
      name="buttons"
      :can-submit="canSubmit"
    >
      <div class="edit-stock-form--buttons">
        <button
          type="submit"
          class="primary"
          :disabled="!canSubmit"
        >
          Update
        </button>
      </div>
    </slot>
  </form>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watchEffect } from 'vue';

// Utils
import { validateStockName, validateStockSymbol, validateStockSharesNotNegative } from '@/utils/validators';
import Money from '@/utils/money';

// Components
import BaseInput from '@/components/BaseInput.vue';
import CurrencyInput from '@/components/CurrencyInput.vue';

export default defineComponent({
  components: {
    BaseInput,
    CurrencyInput,
  },
  props: {
    selected: {
      type: Object as PropType<Stock|null>,
      default: null,
    },
    loading: {
      type: Boolean,
      required: true,
    },
  },
  emits: [
    'submit',
  ],
  setup(props, { emit }) {
    const name = ref('');
    const nameError = ref('');
    const symbol = ref('');
    const symbolError = ref('');
    const rawDescription = ref('');
    const amount = ref('');
    const amountError = ref('');

    const canSubmit = computed(() => {
      if (props.loading) return false;
      if (!props.selected) return false;
      if (nameError.value.length > 0) return false;
      if (symbolError.value.length > 0) return false;
      if (amountError.value.length > 0) return false;
      return true;
    });

    function reset() {
      name.value = '';
      symbol.value = '';
      amount.value = '0.00';
    }

    function sync(stock: Stock) {
      name.value = stock.name;
      symbol.value = stock.symbol;
      amount.value = Money.fromNumber(stock.currentValue).toString().replace('$', '');
      rawDescription.value = stock.rawDescription;
    }

    function handleSubmit() {
      if (!canSubmit.value) return;
      if (!props.selected) return;

      const res: UpdateStockRequest = {
        id: props.selected.id,
        name: name.value,
        symbol: symbol.value,
        currentValue: Money.fromStringOrDefault(amount.value).getAmount(),
        rawDescription: rawDescription.value,
      };

      emit('submit', res);
    }

    watchEffect(() => {
      if (props.selected === null) {
        reset();
      } else {
        sync(props.selected);
      }
    });

    return {
      validateStockName,
      validateStockSymbol,
      validateStockSharesNotNegative,
      name,
      nameError,
      symbol,
      symbolError,
      rawDescription,
      amount,
      amountError,
      canSubmit,
      handleSubmit,
    };
  },
});
</script>

<style lang="scss">
  .edit-stock-form {
    &--buttons {
      margin-top: 1rem;
      text-align: right;
    }
  }
</style>
