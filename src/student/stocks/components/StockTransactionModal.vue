<script setup lang="ts">
import type { Stock } from '@/common/services/stock';
import type { Share } from '@/common/services/share';

// Core
import { ref, toRef, computed, watch, watchEffect } from 'vue';

/// Utils
import Money from '@/common/utils/Money';
import validatePositiveNumberWhole from '@/common/validators/validatePositiveWholeNumber';

// Composables
import useGlobalStore from '@/student/common/composables/useGlobalStore';
import useTransactionCalculations from '@/student/common/composables/useTransactionCalculation';

// Components
import { VInput } from '@/common/components/inputs';
import ModalDialog from '@/common/components/ModalDialog.vue';
import ShareSelector from '@/common/components/ShareSelector.vue';
import LoadingLabel from '@/common/components/LoadingLabel.vue';

type StockSubset = Pick<Stock, 'id' | 'currentValue' | 'symbol' | 'name'>;

const props = withDefaults(
  defineProps<{
    show: boolean;
    stock: StockSubset | null;
    buy?: boolean;
  }>(),
  {
    buy: true,
  }
);

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'cancel'): void;
}>();

// Set some sane defaults if our parent component hasn't provided a stock yet
const stock = toRef(() => {
  if (props.stock) return props.stock;

  return {
    id: -1,
    symbol: 'UNK',
    name: 'Unknown',
    currentValue: 0,
  };
});

const verb = computed(() => (props.buy ? 'Buy' : 'Sell'));

const title = computed(() => `${verb.value} ${stock.value.symbol}`);

const globalStore = useGlobalStore();

const shares = toRef(() => globalStore.share.shares.value);

const holdings = ref(0);

const purchasing = ref(false);

const loadingHoldings = ref(false);

const studentStocksLoading = toRef(
  () => globalStore.studentStock.loading.value
);

const loading = toRef(
  () =>
    globalStore.stock.loading.value ||
    studentStocksLoading.value ||
    globalStore.share.loading.value ||
    purchasing.value ||
    loadingHoldings.value
);

const submitLabel = computed(() => (loading.value ? 'Loading...' : verb.value));

const selectedShare = ref<Share | null>(null);

const {
  amount,
  currentBalance,
  fee,
  remainingBalance,
  negativeError,
  withdrawalLimitError,
  withdrawalLimitFeeError,
} = useTransactionCalculations(() => selectedShare.value);

const quantity = ref('0');

const quantityError = ref('');

// If the user is trying to sell stocks, the quantity is negative
const adjustedQuantity = computed(() => {
  const qty = +quantity.value;
  if (Number.isNaN(qty)) return 0;
  return props.buy ? qty : qty * -1;
});

const totalAmount = computed(() => {
  if (adjustedQuantity.value < 0 && props.buy) {
    return Money.fromNumber(0);
  }

  return Money.fromNumber(stock.value.currentValue * adjustedQuantity.value);
});

const remainingShares = computed(
  () => holdings.value - Math.abs(adjustedQuantity.value)
);

const canSubmit = computed(() => {
  if (loading.value) return false;
  if (selectedShare.value === null) return false;
  if (negativeError.value) return false;
  if (quantityError.value.length) return false;
  if (withdrawalLimitError.value) return false;
  if (withdrawalLimitFeeError.value) return false;
  return true;
});

function validate(value: string): string | boolean {
  const isValid = validatePositiveNumberWhole(value);
  if (isValid !== true) return isValid;

  const qty = +value;
  const remaining = holdings.value - qty;

  if (remaining < 0) {
    return 'You cannot sell more shares than you own.';
  }

  return true;
}

async function findById() {
  if (stock.value.id === -1) return;

  loadingHoldings.value = true;

  try {
    const data = await globalStore.studentStock.findById(
      globalStore.user.id.value,
      stock.value.id
    );

    holdings.value = data?.sharesOwned ?? 0;
  } catch (e) {
    if (e instanceof Error) {
      globalStore.error.setCurrentError(
        `Unable to determine stock holdings: ${e.message}`
      );
    } else {
      globalStore.error.setCurrentError('An unknown error occurred.');
    }
  } finally {
    loadingHoldings.value = false;
  }
}

async function handleSubmit() {
  if (!canSubmit.value) return;

  purchasing.value = true;

  try {
    await globalStore.stock.purchase({
      stockId: stock.value.id,
      shareId: selectedShare.value?.id ?? -1,
      quantity: adjustedQuantity.value,
    });
  } catch (e) {
    if (e instanceof Error) {
      globalStore.error.setCurrentError(e.message);
    } else {
      globalStore.error.setCurrentError('An unknown error has occurred.');
    }
  } finally {
    purchasing.value = false;
  }

  emit('submit');
}

watch(
  () => totalAmount.value,
  (newValue) => {
    amount.value = newValue;
  }
);

watchEffect(() => {
  if (props.show) {
    quantity.value = '0';
    quantityError.value = '';
    selectedShare.value = null;
    findById();
  }
});
</script>

<template>
  <modal-dialog
    :show="show"
    :title="title"
    cancel-label="Cancel"
    :submit-label="submitLabel"
    :can-cancel="!purchasing"
    :can-submit="canSubmit"
    @cancel="$emit('cancel')"
    @submit="handleSubmit"
  >
    <div class="split-data">
      <span>Name</span>
      <span class="nowrap">{{ stock.name }}</span>
    </div>

    <div class="split-data">
      <span>Symbol</span>
      <span>{{ stock.symbol }}</span>
    </div>

    <div class="split-data">
      <span>Current Market Value</span>
      <span class="nowrap">
        {{ Money.fromNumber(stock?.currentValue ?? 0) }}
      </span>
    </div>

    <div class="split-data">
      <span>Current Holdings</span>
      <span class="nowrap" :class="{ loading: loadingHoldings }">
        {{ holdings }}
      </span>
    </div>

    <div class="section">
      <share-selector
        v-model="selectedShare"
        :shares="shares"
        label="Funding Account"
        required
      />

      <v-input
        v-model="quantity"
        v-model:error="quantityError"
        :label="`Quantity to ${verb}`"
        :validator="validate"
        required
      />
    </div>

    <div class="split-data">
      <span>Total</span>
      <span class="nowrap">{{ totalAmount }}</span>
    </div>

    <div class="split-data">
      <span>Current Balance</span>
      <span class="nowrap" :class="{ error: currentBalance.compare(0) === -1 }">
        {{ currentBalance }}
      </span>
    </div>

    <div v-if="fee.compare(0) > 0" class="split-data">
      <span>Transaction Fee</span>
      <span class="nowrap">{{ fee }}</span>
    </div>

    <div class="split-data">
      <span>New Balance</span>
      <span
        class="nowrap"
        :class="{ error: remainingBalance.compare(0) === -1 }"
      >
        {{ remainingBalance }}
      </span>
    </div>

    <div class="split-data">
      <span>Remaining Shares</span>
      <span>{{ remainingShares }}</span>
    </div>

    <template #submitLabel="{ label }">
      <loading-label :show="loading">{{ label }}</loading-label>
    </template>
  </modal-dialog>
</template>
