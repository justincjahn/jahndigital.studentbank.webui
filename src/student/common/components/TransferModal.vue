<script setup lang="ts">
import type { Share } from '@/common/services/share';
import type { NewTransferMutationVariables } from '@/generated/graphql';

// Core
import { ref, computed, watch, watchEffect } from 'vue';

// Utils
import Money from '@/common/utils/Money';

// Composables
import useGlobalStore from '@/student/common/composables/useGlobalStore';
import useShareName from '@/student/common/composables/useShareName';
import useTransactionCalculations from '@/student/common/composables/useTransactionCalculation';

// Components
import { VInput, VCurrency } from '@/common/components/inputs';
import ModalDialog from '@/common/components/ModalDialog.vue';
import ShareSelector from '@/common/components/ShareSelector.vue';

const props = defineProps<{
  // If the modal should be shown
  show: boolean;

  // If the transaction is posting
  loading: boolean;

  // The source share for the transfer.
  source: Share | null;
}>();

const emit = defineEmits<{
  (event: 'submit', data: NewTransferMutationVariables): void;
  (event: 'cancel'): void;
}>();

const globalStore = useGlobalStore();

const {
  amount,
  currentBalance,
  fee,
  remainingBalance,
  negativeError,
  withdrawalLimitError,
  withdrawalLimitFeeError,
} = useTransactionCalculations(() => props.source);

const destination = ref<Share | null>(null);
const amountError = ref('');
const comment = ref('');

const submitLabel = computed(() => (props.loading ? 'Loading...' : 'Transfer'));

const canSubmit = computed(() => {
  if (props.loading) return false;
  if (destination.value === null) return false;
  if (negativeError.value) return false;
  if (amountError.value.length) return false;
  if (withdrawalLimitError.value) return false;
  if (withdrawalLimitFeeError.value) return false;
  return true;
});

const { name } = useShareName(() => props.source);

const availableShares = computed(() =>
  globalStore.share.shares.value.filter((x) => x.id !== props.source?.id ?? -1)
);

const destinationBalance = computed(() =>
  Money.fromNumber(destination.value?.balance ?? 0).add(amount.value as Money)
);

function handleSubmit() {
  if (!canSubmit.value) return;

  emit('submit', {
    sourceShareId: props.source?.id ?? -1,
    destinationShareId: destination.value?.id ?? -1,
    amount: amount.value.getAmount(),
    comment: comment.value.length > 0 ? comment.value : undefined,
  });
}

/**
 * Layer on the errors from the VCurrency component with our own calculations.
 *
 * @param value The error from the component.
 */
function handleAmountError(value: string) {
  if (value.length > 0) {
    amountError.value = value;
  } else if (remainingBalance.value.compare(0) === -1) {
    amountError.value = 'Transfer amount exceeds available balance.';
  } else {
    amountError.value = '';
  }
}

// When the remaining balance changes, trigger a recalculation of the amount
/// error.
watch(
  () => remainingBalance.value,

  () => {
    handleAmountError(amountError.value);
  }
);

// Clear the form when it's shown
watchEffect(() => {
  if (props.show) {
    destination.value = null;
    amount.value = Money.fromNumber(0.0);
    handleAmountError('Amount cannot be zero.');
    comment.value = '';
  }
});
</script>

<template>
  <modal-dialog
    :show="show"
    title="Funds Transfer"
    cancel-label="Cancel"
    :submit-label="submitLabel"
    :can-cancel="!loading"
    :can-submit="canSubmit"
    @cancel="$emit('cancel')"
    @submit="handleSubmit"
  >
    <h3 class="size-l">{{ name }}</h3>

    <p class="emphasis split-data">
      <span>Available Balance</span>
      <span :class="{ error: currentBalance.compare(0) === -1 }">
        {{ currentBalance }}
      </span>
    </p>

    <div class="section">
      <share-selector
        v-model="destination"
        label="Destination"
        :shares="availableShares"
        required
      />

      <v-currency
        v-model="amount"
        :error="amountError"
        label="Amount"
        :allow-negative="false"
        :allow-zero="false"
        required
        @update:error="handleAmountError"
      />

      <v-input v-model="comment" label="Comment" />
    </div>

    <p v-if="fee.compare(0) > 0" class="split-data">
      <span>Transaction Fee</span>
      <span>{{ fee }}</span>
    </p>

    <p class="split-data">
      <span>Remaining Balance</span>
      <span :class="{ error: negativeError }">
        {{ remainingBalance }}
      </span>
    </p>

    <p class="split-data">
      <span>Destination Balance</span>
      <span :class="{ error: destinationBalance.compare(0) === -1 }">
        {{ destinationBalance }}
      </span>
    </p>
  </modal-dialog>
</template>
