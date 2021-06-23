<template>
  <modal
    title="Funds Transfer"
    cancel-label="Cancel"
    ok-label="Transfer"
    class="transfer-modal large"
    :show="show"
    :can-submit="isValid"
    :handle-enter="isValid"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <share-info class="flex banded" :share="source" />

    <base-input label="Destination" required>
      <share-selector
        v-model="selected"
        :shares="shares"
      />
    </base-input>

    <currency-input
      v-model="amount"
      v-model:error="amountError"
      label="Amount"
      required
      :validator="amountValid"
    />

    <base-input
      v-model="comment"
      v-model:error="commentError"
      label="Comment"
    />

    <div class="transfer-modal__summary">
      <p v-if="feeAmount.getAmount() > 0">
        <span>Excessive Transaction Fee:</span>
        {{ feeAmount.toString() }}
      </p>

      <p>
        <span>Remaining Balance:</span>
        {{ remainingBalance.toString() }}
      </p>
    </div>
  </modal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watchEffect } from 'vue';

// Utils
import uuid4 from '@/utils/uuid4';

import {
  validateAmountNotNegative,
  validateAmountNonzero,
  validateTransactionComment,
} from '@/utils/validators';

import useValidation from '@/composables/useValidation';

// Components
import Modal from '@/components/Modal.vue';
import BaseInput from '@/components/BaseInput.vue';
import CurrencyInput from '@/components/CurrencyInput.vue';
import ShareSelector from '../../components/ShareSelector.vue';
import ShareInfo from '../../components/ShareInfo.vue';

// Composables
import useShareName from '../../composables/useShareName';
import useTransactionCalculations from '../../composables/useTransactionCalculations';

export default defineComponent({
  components: {
    Modal,
    BaseInput,
    ShareInfo,
    ShareSelector,
    CurrencyInput,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    source: {
      type: Object as PropType<Share|null>,
      default: null,
    },
    shares: {
      type: Object as PropType<Share[]>,
      default: [] as Share[],
    },
  },
  emits: [
    'ok',
    'cancel',
  ],
  setup(props, { emit }) {
    const id = uuid4();

    const selected = ref<Share|null>(null);

    const amountError = ref('');

    const {
      amount,
      amountMoney,
      feeAmount,
      remainingBalance,
      withdrawalLimitError,
      withdrawalLimitFeeError,
    } = useTransactionCalculations(() => props.source);

    const { name: shareName } = useShareName(() => selected.value);

    const { value: comment, error: commentError } = useValidation(validateTransactionComment);

    const isValid = computed(() => {
      if (selected.value === null) return false;
      if (amountError.value !== '') return false;
      if (commentError.value !== '') return false;
      return true;
    });

    /**
     * Validate amount
     */
    function amountValid(value: string): boolean | string {
      if (props.source === null) return 'Unknown error';

      let valid = validateAmountNotNegative(value);
      if (valid !== true) return valid;

      valid = validateAmountNonzero(value);
      if (valid !== true) return valid;

      if (remainingBalance.value.getAmount() < 0) {
        return 'Transfer amount exceeds available balance.';
      }

      return true;
    }

    /**
     * Tell the parent to post the transfer.
     */
    function handleOk() {
      emit('ok', {
        destination: selected.value,
        comment: comment.value,
        amount: amountMoney.value.getAmount(),
      });
    }

    /**
     * Cancel the transfer and ask the parent to close
     */
    function handleCancel() {
      emit('cancel');
    }

    watchEffect(() => {
      if (props.show === true) {
        amount.value = '0.00';
        comment.value = '';
        selected.value = null;
      }
    });

    return {
      id,
      selected,
      amount,
      amountError,
      comment,
      commentError,
      shareName,
      feeAmount,
      remainingBalance,
      withdrawalLimitError,
      withdrawalLimitFeeError,
      isValid,
      amountValid,
      handleOk,
      handleCancel,
    };
  },
});
</script>

<style lang="scss">
  .transfer-modal {
    &.large .modal__container {
      max-width: 30rem;
    }

    .share-info {
      margin-bottom: 1em;
    }

    &__summary {
      margin-top: 1em;

      p {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }
    }
  }
</style>
