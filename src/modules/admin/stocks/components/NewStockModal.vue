<template>
  <modal
    :show="show"
    class="large"
    title="New Stock"
    ok-label="Create"
    cancel-label="Cancel"
    :can-submit="canSubmit"
    :handle-enter="canSubmit"
    :can-cancel="!loading"
    :handle-escape="!loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <form @submit.prevent>
      <base-input
        v-model="name"
        v-model:error="nameError"
        required
        label="Name"
        name="name"
        :validator="validateStockName"
      />

      <base-input
        v-model="symbol"
        v-model:error="symbolError"
        required
        label="Symbol"
        name="symbol"
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
        required
        label="Initial Value"
        :allow-negative="false"
      />
    </form>
  </modal>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watchEffect } from 'vue';

// Utils
import { validateStockName, validateStockSymbol, validateStockSharesNotNegative } from '@/utils/validators';
import Money from '@/utils/money';

// Components
import Modal from '@/components/Modal.vue';
import BaseInput from '@/components/BaseInput.vue';
import CurrencyInput from '@/components/CurrencyInput.vue';

/**
 * Prompts the user for input and emits an ok event with a valid NewStockRequest object.
 */
export default defineComponent({
  components: {
    Modal,
    BaseInput,
    CurrencyInput,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
  },
  emits: [
    'ok',
    'cancel',
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
      if (nameError.value.length > 0) return false;
      if (symbolError.value.length > 0) return false;
      if (amountError.value.length > 0) return false;
      return true;
    });

    function handleOk() {
      if (!canSubmit.value) return;

      const req: NewStockRequest = {
        name: name.value,
        symbol: symbol.value,
        rawDescription: rawDescription.value,
        currentValue: Money.fromStringOrDefault(amount.value).getAmount(),
      };

      emit('ok', req);
    }

    function handleCancel() {
      emit('cancel');
    }

    function reset() {
      name.value = '';
      symbol.value = '';
      amount.value = '0.00';
      amountError.value = '';
    }

    watchEffect(() => {
      if (props.show) {
        reset();
      }
    });

    return {
      validateStockName,
      validateStockSymbol,
      validateStockSharesNotNegative,
      amount,
      amountError,
      name,
      nameError,
      symbol,
      symbolError,
      rawDescription,
      canSubmit,
      handleOk,
      handleCancel,
    };
  },
});
</script>
