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
    <div class="transfer-modal__summary">
      <p class="transfer-modal__summary--share-name">
        {{ shareName }}
      </p>

      <p class="transfer-modal__summary--balance">
        Available Balance:

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
    </div>

    <div class="transfer-modal__fieldset">
      <label :for="`transfer-modal__input--${id}`">
        Amount<span class="required">*</span>
      </label>

      <currency-input
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
      <label>
        Destination<span class="required">*</span>
      </label>

      <share-selector
        v-model="selected"
        :shares="shares"
      />
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
import userStore from '@/store/user';

// Composables
import useValidation from '@/composables/useValidation';

// Components
import Modal from '@/components/Modal.vue';
import CurrencyInput from '@/components/CurrencyInput.vue';
import ShareSelector from './ShareSelector.vue';

export default defineComponent({
  components: {
    Modal,
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
      type: Array as PropType<Share[]>,
      default: [],
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

    const isValid = computed(() => {
      if (selected.value === null) return false;
      if (amountError.value !== '') return false;
      if (commentError.value !== '') return false;
      return true;
    });

    /**
     * Validate that the amount is not z
     */
    function amountValid(value: string): boolean | string {
      if (props.source === null) return 'Unknown error';

      let valid = validateAmountNotNegative(value);
      if (valid !== true) return valid;

      valid = validateAmountNonzero(value);
      if (valid !== true) return valid;

      const num = Money.fromString(value);
      if (num.getAmount() > props.source.balance) {
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
    &__summary {
      &--share-name {
        font-weight: bold;
        font-size: 1.1em;
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
  }
</style>
