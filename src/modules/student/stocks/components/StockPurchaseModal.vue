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

    <div class="stock-purchase-modal--fieldset">
      <label>
        Funding Account
      </label>

      <share-selector
        v-model="selectedShare"
        :shares="shares"
      />
    </div>

    <div class="stock-purchase-modal--fieldset">
      <label :for="`stock-purchase-modal__quantity--${id}`">
        Quantity to Buy or Sell
      </label>

      <input
        :id="`stock-purchase-modal__quantity--${id}`"
        v-model="quantity"
        type="text"
        placeholder="0"
        pattern="^-?[0-9]+$"
        required
      />

      <p v-if="quantityError" class="error">
        {{ quantityError }}
      </p>
    </div>

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
      <li>
        <span>New Balance</span>
        {{
          new Intl.NumberFormat(
            'en-US',
            {
              style: 'currency',
              currency: 'USD',
            }
          ).format(newBalance)
        }}
      </li>
    </ul>
  </modal>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, PropType, ref, computed, watch } from 'vue';

// Composables
import useValidation from '@/composables/useValidation';

// Utils
import uuid4 from '@/utils/uuid4';

// Services
import { getStudentStocks } from '@/services/stock';

// Stores
import errorStore from '@/store/error';
import userStore from '@/store/user';

export default defineComponent({
  components: {
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
  },
  emits: [
    'ok',
    'cancel',
  ],
  setup(props, { emit }) {
    const id = uuid4();

    const loading = ref(false);

    const selectedShare = ref<Share|null>(null);

    const studentStock = ref<StudentStock|null>(null);

    const title = computed(() => {
      if (props.stock === null) return 'Purchase Stock';
      return `Buy/Sell ${props.stock.symbol}`;
    });

    const sharesOwned = computed(() => {
      if (studentStock.value === null) return 0;
      return studentStock.value.sharesOwned;
    });

    const currentValue = computed(() => {
      if (props.stock === null) return 0.0;
      return props.stock.currentValue;
    });

    /**
     * Ensures that the quantity field contains a valid number, the
     * student has enough funds in the selected account, or the
     * student has enough shares to sell.
     */
    function validateQuantity(value: string): string | boolean {
      if (!value || value.trim().length === 0 || value === '0') {
        return 'Quantity is required and cannot be zero.';
      }

      if (value.indexOf('.') >= 0) {
        return 'Quantity must be a whole number.';
      }

      let shares = +value;
      if (Number.isNaN(shares)) shares = 0;

      const shareBalance = selectedShare.value?.balance ?? 0;
      const totalAmount = shares * currentValue.value;
      if (totalAmount > shareBalance) {
        return 'The selected account does not have the funds to purchase this quantity.';
      }

      if (shares < 0 && (shares * -1) > sharesOwned.value) {
        return 'Quantity exceeds the number of shares you currently own.';
      }

      return true;
    }

    const { value: quantity, error: quantityError } = useValidation(validateQuantity);

    const total = computed(() => {
      const value = +quantity.value * currentValue.value * -1;
      if (Number.isNaN(value)) return 0;
      return value;
    });

    const newBalance = computed(() => (selectedShare.value?.balance ?? 0.0) + total.value);

    const okLabel = computed(() => {
      if (props.loading || loading.value) return 'Loading...';
      if (total.value > 0) return 'Sell';
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
        quantity: +quantity.value,
        shareId: selectedShare.value?.id ?? -1,
      });
    }

    function handleCancel() {
      emit('cancel');
    }

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
              stockId: props.stock.id,
            },
          });

          if (res.studentStocks.nodes.length > 0) {
            // eslint-disable-next-line prefer-destructuring
            studentStock.value = res.studentStocks.nodes[0];
          } else {
            studentStock.value = null;
          }
        } catch (e) {
          errorStore.setCurrentError(e?.message ?? e);
        } finally {
          loading.value = false;
        }
      }
    });

    return {
      id,
      selectedShare,
      title,
      okLabel,
      sharesOwned,
      currentValue,
      quantity,
      quantityError,
      total,
      newBalance,
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

  &--fieldset {
    display: flex;
    flex-direction: column;

    & + & {
      margin-top: 1em;
    }
  }
}
</style>
