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

const verb = computed(() => (props.buy ? 'Purchase' : 'Sell'));

const title = computed(() => `${verb.value} ${stock.value.symbol}`);

const globalStore = useGlobalStore();

const holdings = computed(() => {
  if (stock.value.id === -1) return 0;
  const studentStocks = globalStore.studentStock.stocks.value;
  const studentStock = studentStocks.find((x) => x.id === stock.value.id);
  return studentStock?.sharesOwned ?? 0;
});

const shares = toRef(() => globalStore.share.shares.value);

const purchasing = ref(false);

const loading = toRef(
  () =>
    globalStore.stock.loading.value ||
    globalStore.studentStock.loading.value ||
    globalStore.share.loading.value ||
    purchasing.value
);

// Form values
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
const adjustedQuantity = computed(() =>
  props.buy ? +quantity.value : +quantity.value * -1
);

const totalAmount = computed(() => {
  if (Number.isNaN(adjustedQuantity.value) || adjustedQuantity.value < 0) {
    return Money.fromNumber(0);
  }

  return Money.fromNumber(
    (stock.value.currentValue ?? 0) * adjustedQuantity.value
  );
});

const canSubmit = computed(() => {
  if (loading.value) return false;
  if (selectedShare.value === null) return false;
  if (negativeError.value) return false;
  if (quantityError.value.length) return false;
  if (withdrawalLimitError.value) return false;
  if (withdrawalLimitFeeError.value) return false;
  return true;
});

async function handleSubmit() {
  if (!canSubmit.value) return;

  purchasing.value = true;

  try {
    await globalStore.stock.purchase({
      stockId: stock.value.id,
      shareId: selectedShare.value?.id ?? -1,
      quantity: adjustedQuantity.value,
    });
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
    selectedShare.value = null;

    // Make sure everything is up to date
    globalStore.share.fetch();
    globalStore.studentStock.fetch({
      studentId: globalStore.user.id.value,
      cache: false,
    });
  }
});
</script>

<template>
  <modal-dialog
    :show="show"
    :title="title"
    cancel-label="Cancel"
    :submit-label="verb"
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
      <span>{{ stock?.symbol }}</span>
    </div>

    <div class="split-data">
      <span>Current Market Value</span>
      <span>{{ Money.fromNumber(stock?.currentValue ?? 0) }}</span>
    </div>

    <div class="split-data">
      <span>Current Holdings</span>
      <span>{{ holdings }}</span>
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
        :validator="validatePositiveNumberWhole"
        required
      />
    </div>

    <div class="split-data">
      <span>Total</span>
      <span>{{ totalAmount }}</span>
    </div>

    <div class="split-data">
      <span>Current Balance</span>
      <span :class="{ error: currentBalance.compare(0) === -1 }">
        {{ currentBalance }}
      </span>
    </div>

    <div v-if="fee.compare(0) > 0" class="split-data">
      <span>Transaction Fee</span>
      <span>{{ fee }}</span>
    </div>

    <div class="split-data">
      <span>New Balance</span>
      <span :class="{ error: remainingBalance.compare(0) === -1 }">
        {{ remainingBalance }}
      </span>
    </div>
  </modal-dialog>
</template>
