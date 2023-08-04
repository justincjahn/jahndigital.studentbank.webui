<script setup lang="ts">
// Types
import type { IMoney } from '@/common/utils/Money';
import type { Share } from '@/common/services/share';
import type { TransactionStore } from '@/common/stores/transaction';

// Core
import { computed, ref, watchEffect } from 'vue';

// Components
import { VInput, VCurrency } from '@/common/components/inputs';
import LoadingLabel from '@/common/components/LoadingLabel.vue';
import ModalDialog from '@/common/components/ModalDialog.vue';

// Utils
import Money from '@/common/utils/Money';
import validateAmount from '@/common/validators/validateAmount';

// Stores
import errorStore from '@/common/stores/error';

const props = defineProps<{
  // If the modal should be shown
  show: boolean;

  // The Share that's being transacted on
  share: Share | null;

  // The store to use when posting transactions
  store: TransactionStore;
}>();

const emit = defineEmits<{
  (event: 'submit'): void;
  (event: 'cancel'): void;
}>();

const loading = ref(false);
const amount = ref<IMoney>(Money.fromNumber(0));
const comment = ref('');

const newBalance = computed(() =>
  Money.fromNumber(props.share?.balance ?? 0).add(amount.value as Money)
);

const commentError = computed(() => {
  const isZero = amount.value.compare(0) === 0;

  if (isZero && comment.value.trim().length === 0) {
    return 'If the amount is zero, you must provide a comment.';
  }

  return '';
});

const canSubmit = computed(() => {
  if (commentError.value.length > 0) return false;
  if (loading.value) return false;
  return true;
});

/**
 * Fired when the user wants to submit the modal's form.
 */
async function handleSubmit() {
  if (props.share === null) return;

  loading.value = true;

  try {
    await props.store.create({
      shareId: props.share.id,
      amount: amount.value.getAmount(),
      comment: comment.value.trim().length > 0 ? comment.value : undefined,
      takeNegative: true,
    });
  } catch (e) {
    if (e instanceof Error) {
      errorStore.setCurrentError(e?.message ?? e);
    }
  } finally {
    loading.value = false;
  }

  emit('submit');
}

/**
 * When the form opens, reset it to default.
 */
watchEffect(() => {
  if (props.show === true) {
    amount.value = Money.fromNumber(0);
    comment.value = '';
  }
});
</script>

<template>
  <modal-dialog
    :show="show"
    :can-submit="canSubmit"
    :can-cancel="!loading"
    title="Post Transaction"
    submit-label="Post"
    cancel-label="Cancel"
    @cancel="$emit('cancel')"
    @submit="handleSubmit"
  >
    <template v-if="share !== null">
      <h1>{{ share.shareType.name }} (S{{ share.id }})</h1>

      <div class="balance">
        <span>Available Balance</span>
        <span>{{ Money.fromNumber(share.balance) }}</span>
      </div>

      <div class="balance">
        <span>New Balance</span>

        <span :class="{ error: newBalance.compare(0) < 0 }">
          {{ newBalance }}
        </span>
      </div>

      <v-currency
        v-model="amount"
        label="Amount"
        :allow-negative="true"
        :allow-zero="true"
        :validator="validateAmount"
        required
      />

      <v-input
        v-model="comment"
        label="Comment"
        :required="amount.compare(0) === 0"
        :error="commentError"
      />
    </template>

    <template #submitLabel="{ label }">
      <loading-label :show="loading">
        <template v-if="loading">Please Wait...</template>
        <template v-else>{{ label }}</template>
      </loading-label>
    </template>
  </modal-dialog>
</template>

<style scoped>
.balance {
  font-size: 1em;
  font-weight: 400;
  display: flex;
  justify-content: space-between;
}

.balance + .balance {
  margin-bottom: 1em;
}

.balance :nth-child(1) {
  overflow: hidden;
  text-overflow: clip;
  white-space: nowrap;
}

.balance :nth-child(1)::after {
  content: '...........................................................................';
}
</style>
