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
    <div class="transfer-modal__header">
      <p class="transfer-modal__header--share-name">
        {{ shareName }}
      </p>

      <p class="transfer-modal__header--info">
        <span>Available Balance</span>

        {{
          new Intl.NumberFormat(
            'en-US',
            {
              style: 'currency',
              currency: 'USD',
            }
          ).format(source?.balance ?? 0)
        }}
      </p>

      <template v-if="source?.shareType?.withdrawalLimitCount ?? 0 > 0">
        <p class="transfer-modal__header--info">
          <span>Withdrawal Limit</span>
          {{ source?.shareType?.withdrawalLimitCount ?? 0 }}
        </p>

        <p class="transfer-modal__header--info">
          <span>Withdrawal Limit Period</span>
          {{ source?.shareType?.withdrawalLimitPeriod ?? 'UNKNOWN' }}
        </p>

        <p class="transfer-modal__header--info">
          <span>Withdrawals this Period</span>
          {{ source?.limitedWithdrawalCount ?? 0 }}
        </p>
      </template>
    </div>

    <div class="transfer-modal__fieldset">
      <label>
        Destination<span class="required">*</span>
      </label>

      <share-selector
        v-model="selected"
        :shares="shares"
      />
    </div>

    <div class="transfer-modal__fieldset">
      <label :for="`transfer-modal__input--${id}`">
        Amount<span class="required">*</span>
      </label>

      <base-currency-input
        :id="`transfer-modal__input--${id}`"
        v-model="amount"
        v-model:error="amountError"
        class="transfer-modal__input"
        :validator="amountValid"
      />

      <p v-if="amountError" class="error">
        {{ amountError }}
      </p>
    </div>

    <div class="transfer-modal__fieldset">
      <label :for="`transfer-modal__comment--${id}`">
        Comment
      </label>

      <input
        :id="`transfer-modal__comment--${id}`"
        v-model="comment"
        type="text"
        name="comment"
      />

      <p v-if="commentError" class="error">
        {{ commentError }}
      </p>
    </div>

    <div class="transfer-modal__summary">
      <p v-if="feeAmount.getAmount() > 0">
        <span>Excessive Transaction Fee:</span>

        {{
          new Intl.NumberFormat(
            'en-US',
            {
              style: 'currency',
              currency: 'USD',
            }
          ).format(feeAmount.getAmount())
        }}
      </p>

      <p>
        <span>Remaining Balance:</span>

        {{
          new Intl.NumberFormat(
            'en-US',
            {
              style: 'currency',
              currency: 'USD',
            }
          ).format(remainingBalance.getAmount())
        }}
      </p>
    </div>
  </modal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watchEffect } from 'vue';

// Utils
import uuid4 from '@/utils/uuid4';
import Money from '@/utils/money';

import {
  validateAmountNotNegative,
  validateAmountNonzero,
  validateTransactionComment,
} from '@/utils/validators';

// Stores
import userStore from '@/stores/user';

// Composables
import useValidation from '@/composables/useValidation';

// Components
import Modal from '@/components/Modal.vue';
import BaseCurrencyInput from '@/components/BaseCurrencyInput.vue';
import ShareSelector from '../../components/ShareSelector.vue';

export default defineComponent({
  components: {
    Modal,
    ShareSelector,
    BaseCurrencyInput,
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

    const amount = ref('0.00');

    const amountError = ref('');

    const accountNumber = computed(() => userStore.id.value.toString().padStart(10, '0'));

    const { value: comment, error: commentError } = useValidation(validateTransactionComment);

    const shareName = computed(() => {
      if (!props.source) return 'Unknown';
      return `${props.source.shareType?.name ?? 'Unknown'} (${accountNumber.value}S${props.source.id})`;
    });

    const withdrawalLimitError = computed(() => {
      if (!props.source) return false;
      if (!props.source.shareType) return false;
      if (props.source.shareType.withdrawalLimitCount <= 0) return false;

      if (props.source.limitedWithdrawalCount >= props.source.shareType.withdrawalLimitCount) {
        return true;
      }

      return false;
    });

    const withdrawalLimitFeeError = computed(() => {
      if (!withdrawalLimitError.value) return false;
      if (props.source?.shareType?.withdrawalLimitShouldFee ?? false) return true;
      return false;
    });

    const feeAmount = computed(() => {
      if (withdrawalLimitFeeError.value) {
        return Money.fromNumber(props.source?.shareType?.withdrawalLimitFee ?? 0);
      }

      return Money.fromNumber(0);
    });

    const remainingBalance = computed(() => {
      const transferAmount = Money.fromStringOrDefault(amount.value).add(feeAmount.value);
      const shareBalance = Money.fromNumber(props.source?.balance ?? 0);
      return shareBalance.sub(transferAmount);
    });

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
        amount: Money.fromStringOrDefault(amount.value).getAmount(),
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

    &__header {
      &--share-name {
        font-weight: bold;
        font-size: 1.1em;
      }

      &--info {
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        &:nth-child(odd) {
          background-color: colorStep('primary', $step: 2);
        }
      }
    }

    &__fieldset {
      display: flex;
      flex-direction: column;
      margin-top: 1.25em;

      input {
        width: 100%;
      }

      .share-selector {
        display: block;
      }
    }

    .share-name {
      font-weight: bold;
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
