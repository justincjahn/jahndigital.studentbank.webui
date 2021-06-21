<template>
  <form class="edit-stock-form" @submit.prevent="handleSubmit">
    <div class="new-stock-modal--fieldset">
      <label :for="nameId">Name<span class="required">*</span></label>
      <input
        :id="nameId"
        v-model="name"
        type="text"
        name="name"
      />
      <p v-if="selected && nameError" class="error">
        {{ nameError }}
      </p>
    </div>

    <div class="new-stock-modal--fieldset">
      <label :for="symbolId">Symbol<span class="required">*</span></label>
      <input
        :id="symbolId"
        v-model="symbol"
        type="text"
        name="symbol"
      />
      <p v-if="selected && symbolError" class="error">
        {{ symbolError }}
      </p>
    </div>

    <div class="new-stock-modal--fieldset">
      <label :for="totalSharesId">Total Shares<span class="required">*</span></label>
      <input
        :id="totalSharesId"
        v-model="totalShares"
        type="text"
        name="totalShares"
      />
      <p v-if="selected && totalSharesError" class="error">
        {{ totalSharesError }}
      </p>
    </div>

    <div class="new-stock-modal--fieldset">
      <label :for="amountId">Initial Value<span class="required">*</span></label>
      <base-currency-input
        :id="amountId"
        v-model="amount"
        v-model:error="amountError"
        :allow-negative="false"
      />
      <p v-if="selected && amountError" class="error">
        {{ amountError }}
      </p>
    </div>

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
import uuid4 from '@/utils/uuid4';
import Money from '@/utils/money';

// Composables
import useValidation from '@/composables/useValidation';

// Components
import BaseCurrencyInput from '@/components/BaseCurrencyInput.vue';

export default defineComponent({
  components: {
    BaseCurrencyInput,
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
    const id = uuid4();

    const nameId = `new-stock-modal__name--${id}`;
    const { value: name, error: nameError } = useValidation(validateStockName);

    const symbolId = `new-stock-modal__symbol--${id}`;
    const { value: symbol, error: symbolError } = useValidation(validateStockSymbol);

    const totalSharesId = `new-stock-modal__totalShares--${id}`;
    const { value: totalShares, error: totalSharesError } = useValidation(validateStockSharesNotNegative);

    const amountId = `new-stock-modal__amount--${id}`;
    const amount = ref('');
    const amountError = ref('');

    const canSubmit = computed(() => {
      if (props.loading) return false;
      if (!props.selected) return false;
      if (nameError.value.length > 0) return false;
      if (symbolError.value.length > 0) return false;
      if (totalSharesError.value.length > 0) return false;
      if (amountError.value.length > 0) return false;
      return true;
    });

    function reset() {
      name.value = '';
      symbol.value = '';
      totalShares.value = '10000';
      amount.value = '0.00';
    }

    function sync(stock: Stock) {
      name.value = stock.name;
      symbol.value = stock.symbol;
      totalShares.value = stock.totalShares.toString();
      amount.value = Money.fromNumber(stock.currentValue).toString().replace('$', '');
    }

    function handleSubmit() {
      if (!canSubmit.value) return;
      if (!props.selected) return;

      const res: UpdateStockRequest = {
        id: props.selected.id,
        name: name.value,
        symbol: symbol.value,
        totalShares: Number.parseInt(totalShares.value, 10),
        currentValue: Money.fromStringOrDefault(amount.value).getAmount(),
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
      nameId,
      name,
      nameError,
      symbolId,
      symbol,
      symbolError,
      totalSharesId,
      totalShares,
      totalSharesError,
      amountId,
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
