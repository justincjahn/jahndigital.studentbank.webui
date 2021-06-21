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
      <div class="new-stock-modal--fieldset">
        <label :for="nameId">Name<span class="required">*</span></label>
        <input
          :id="nameId"
          v-model="name"
          type="text"
          name="name"
        />
        <p v-if="nameError" class="error">
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
        <p v-if="symbolError" class="error">
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
        <p v-if="totalSharesError" class="error">
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
        <p v-if="amountError" class="error">
          {{ amountError }}
        </p>
      </div>
    </form>
  </modal>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watchEffect } from 'vue';

// Utils
import { validateStockName, validateStockSymbol, validateStockSharesNotNegative } from '@/utils/validators';
import uuid4 from '@/utils/uuid4';
import Money from '@/utils/money';

// Composables
import useValidation from '@/composables/useValidation';

// Components
import Modal from '@/components/Modal.vue';
import BaseCurrencyInput from '@/components/BaseCurrencyInput.vue';

/**
 * Prompts the user for input and emits an ok event with a valid NewStockRequest object.
 */
export default defineComponent({
  components: {
    Modal,
    BaseCurrencyInput,
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
      if (nameError.value.length > 0) return false;
      if (symbolError.value.length > 0) return false;
      if (totalSharesError.value.length > 0) return false;
      if (amountError.value.length > 0) return false;
      return true;
    });

    function handleOk() {
      if (!canSubmit.value) return;

      const req: NewStockRequest = {
        name: name.value,
        symbol: symbol.value,
        totalShares: Number.parseInt(totalShares.value, 10),
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
      totalShares.value = '10000';
    }

    watchEffect(() => {
      if (props.show) {
        reset();
      }
    });

    return {
      id,
      amountId,
      amount,
      amountError,
      nameId,
      name,
      nameError,
      symbolId,
      symbol,
      symbolError,
      totalSharesId,
      totalShares,
      totalSharesError,
      canSubmit,
      handleOk,
      handleCancel,
    };
  },
});
</script>

<style lang="scss">
  .new-stock-modal--fieldset {
    display: flex;
    flex-direction: column;

    & + & {
      margin-top: 1em;
    }

    .currency-input input {
      width: 100%;
    }
  }
</style>
