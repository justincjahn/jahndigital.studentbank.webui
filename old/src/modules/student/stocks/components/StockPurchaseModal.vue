<template>
  <modal
    cancel-label="Cancel"
    class="stock-purchase-modal large"
    :show="show"
    :title="title"
    :ok-label="okLabel"
    :can-submit="canSubmit"
    :handle-enter="canSubmit"
    :can-cancel="!loading"
    :handle-escape="!loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <ul class="stock-purchase-modal__owned">
      <li>
        <span>Name</span>
        {{ stock?.name ?? 'Unknown' }}
      </li>
      <li>
        <span>Symbol</span>
        {{ stock?.symbol ?? 'UNKN' }}
      </li>
      <li>
        <span>Current Market Value</span>
        {{
          new Intl.NumberFormat(
            'en-US',
            {
              style: 'currency',
              currency: 'USD',
            }
          ).format(currentValue)
        }}
      </li>
      <li>
        <span>Current Holdings Quantity</span>
        {{ sharesOwned.toLocaleString('en-US', {minimumFractionDigits: 0}) }}
      </li>
    </ul>

    <base-input
      label="Funding Account"
      required
    >
      <share-selector
        v-model="selectedShare"
        :shares="shares"
      />
    </base-input>

    <base-input
      v-model="quantity"
      v-model:error="quantityError"
      placeholder="0"
      pattern="^-?[0-9]+$"
      maxlength="6"
      required
      :label="`Quantity to ${sell ? 'Sell' : 'Buy'}`"
    />

    <ul class="stock-purchase-modal__total">
      <li>
        <span>Total</span>
        {{
          new Intl.NumberFormat(
            'en-US',
            {
              style: 'currency',
              currency: 'USD',
            }
          ).format(total)
        }}
      </li>
      <li v-if="feeAmount.getAmount() > 0">
        <span>Excess Withdrawal Fee</span>
        {{ `-${feeAmount.toString()}` }}
      </li>
      <li>
        <span>New Balance</span>
        {{ remainingBalance.toString() }}
      </li>
    </ul>
  </modal>
</template>

<script lang="ts">
import { validationFunc } from '@/types';
import { defineComponent, defineAsyncComponent, PropType, ref, computed, watch, watchEffect } from 'vue';

// Composables
import useValidation from '@/composables/useValidation';

// Services
import { getStudentStocks } from '@/services/stock';

// Stores
import errorStore from '@/stores/error';
import userStore from '@/stores/user';

import useTransactionCalculations from '../../composables/useTransactionCalculations';

export default defineComponent({
  components: {
    BaseInput: defineAsyncComponent(() => import('@/components/BaseInput.vue')),
    Modal: defineAsyncComponent(() => import('@/components/Modal.vue')),
    ShareSelector: defineAsyncComponent(() => import('../../components/ShareSelector.vue')),
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    loading: {
      type: Boolean,
      required: false,
      default: true,
    },
    shares: {
      type: Object as PropType<Share[]>,
      default: [] as Share[],
    },
    stock: {
      type: Object as PropType<Stock|null>,
      default: null,
    },
    sell: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'ok',
    'cancel',
  ],
  setup(props, { emit }) {
    const loading = ref(false);

    const selectedShare = ref<Share|null>(null);

    const studentStock = ref<StudentStock|null>(null);

    const title = computed(() => {
      if (!props.stock) return 'Purchase Stock';
      if (props.sell) return `Sell ${props.stock.symbol}`;
      return `Buy ${props.stock.symbol}`;
    });

    const sharesOwned = computed(() => {
      if (!studentStock.value) return 0;
      return studentStock.value.sharesOwned;
    });

    const currentValue = computed(() => {
      if (!props.stock) return 0.0;
      return props.stock.currentValue;
    });
    /**
     * Ensures that the quantity field contains a valid number, the
     * student has enough funds in the selected account, or the
     * student has enough shares to sell.
     */
    const generateValidator = (share: Share|null): validationFunc => (value: string) => {
      if (!value || value.trim().length === 0 || value === '0') {
        return 'Quantity is required and cannot be zero.';
      }

      if (!value.trim().match(/^-?[0-9]+$/)) {
        return 'Quantity must be a whole number.';
      }

      let shares = +value;
      if (Number.isNaN(shares)) shares = 0;

      if (shares < 0) {
        return 'Quantity must be greater than zero.';
      }

      // If we're in 'sell' mode, the quantity should be negative.
      if (props.sell) shares *= -1;

      const shareBalance = share?.balance ?? 0;
      const totalAmount = shares * currentValue.value;
      if (totalAmount > shareBalance) {
        return 'The selected account does not have the funds to purchase this quantity.';
      }

      if (shares < 0 && (shares * -1) > sharesOwned.value) {
        return 'Quantity exceeds the number of shares you currently own.';
      }

      return true;
    };

    const validator = ref(generateValidator(selectedShare.value));
    const { value: quantity, error: quantityError } = useValidation(validator);

    // Depending on if the modal is in buy or sell mode, the quantity should actually be positive or negative.
    const normQuantity = computed(() => {
      const isSell = props.sell ? -1 : 1;
      const qty = +quantity.value;
      if (Number.isNaN(qty)) return 0.0;
      return qty * isSell;
    });

    const {
      amount,
      feeAmount,
      remainingBalance,
    } = useTransactionCalculations(() => selectedShare.value);

    const total = computed(() => {
      if (normQuantity.value === 0.0) return 0.0;
      return normQuantity.value * currentValue.value * -1;
    });

    const okLabel = computed(() => {
      if (props.loading || loading.value) return 'Loading...';
      if (props.sell) return 'Sell';
      return 'Buy';
    });

    const canSubmit = computed(() => {
      if (props.loading) return false;
      if (loading.value) return false;
      if (quantityError.value) return false;
      if (!selectedShare.value) return false;
      return true;
    });

    function handleOk() {
      emit('ok', {
        quantity: normQuantity.value,
        shareId: selectedShare.value?.id ?? -1,
      });
    }

    function handleCancel() {
      emit('cancel');
    }

    // Sync the amount with the calculated total
    watch(() => total.value, (newValue) => {
      amount.value = (-newValue).toString();
    });

    // When the modal is shown, pull data from the server
    watch(() => props.show, async (newValue) => {
      if (newValue === true) {
        selectedShare.value = null;
        quantity.value = '';
      }

      if (newValue === true && props.stock !== null) {
        try {
          loading.value = true;

          const res = await getStudentStocks({
            cache: false,
            studentId: userStore.id.value,
            where: {
              stockId: {
                eq: props.stock.id,
              },
            },
          });

          if (res.studentStocks.nodes.length > 0) {
            [studentStock.value] = res.studentStocks.nodes;
          } else {
            studentStock.value = null;
          }
        } catch (e) {
          if (e instanceof Error) {
            errorStore.setCurrentError(e?.message ?? e);
          }
        } finally {
          loading.value = false;
        }
      }
    });

    watchEffect(() => {
      validator.value = generateValidator(selectedShare.value);
    });

    return {
      selectedShare,
      title,
      okLabel,
      sharesOwned,
      currentValue,
      quantity,
      quantityError,
      total,
      remainingBalance,
      feeAmount,
      canSubmit,
      handleOk,
      handleCancel,
    };
  },
});
</script>

<style lang="scss">
.stock-purchase-modal {
  &.large .modal__container {
    max-width: 30rem;
  }

  &__owned {
    margin: 0 0 1em 0;
  }

  &__total {
    margin: 1em 0 0 0;
  }

  &__owned, &__total {
    list-style: none;

    li {
      display: flex;
      flex-direction: row;

      span {
        font-weight: bold;
        flex-grow: 1;
      }
    }
  }
}
</style>
