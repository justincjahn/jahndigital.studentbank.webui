<script setup lang="ts">
import type { GlobalStore } from '@/admin/common/stores/global';
import type { Stock } from '@/common/services/stock';

import { defineAsyncComponent, computed, ref, watchEffect } from 'vue';

import { API_MAX_CONCURRENCY } from '@/common/constants';

import ModalDialog from '@/common/components/ModalDialog.vue';
import LoadingLabel from '@/common/components/LoadingLabel.vue';
import { VInput } from '@/common/components/inputs';

const StockList = defineAsyncComponent(
  () => import('@/admin/stocks/components/StockList.vue')
);

enum STEP {
  SELECT_STOCKS = 1,
  DATE = 2,
  CONFIRM = 3,
}

const props = defineProps<{
  store: GlobalStore;
  show: boolean;
}>();

const emit = defineEmits<{
  (event: 'submit'): void;
  (event: 'cancel'): void;
}>();

const loading = ref(false);

const stocks = computed(() => props.store.stock.stocks.value);

const selected = ref<Stock[]>([]);

const step = ref<STEP>(STEP.SELECT_STOCKS);

const date = ref('');

const hasNextStep = computed(() => step.value < Object.values(STEP).length / 2);

const hasPreviousStep = computed(() => step.value > 1);

const submitLabel = computed(() => {
  if (hasNextStep.value) {
    return 'Next';
  }

  return 'Purge';
});

const cancelLabel = computed(() => {
  if (hasPreviousStep.value) {
    return 'Previous';
  }

  return 'Cancel';
});

const canSubmit = computed(() => {
  if (loading.value) return false;

  if (selected.value.length > 0) return true;

  if (step.value >= STEP.DATE) {
    if (date.value.length === 10) return true;
  }

  return false;
});

const canCancel = computed(() => !loading.value);

async function handleSubmit() {
  if (hasNextStep.value) {
    step.value += 1;
    return;
  }

  const stocksToPurge = [...selected.value];
  loading.value = true;

  while (stocksToPurge.length) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await Promise.all(
        stocksToPurge
          .splice(0, API_MAX_CONCURRENCY)
          .map((stock) =>
            props.store.stockHistory.purgeHistory(stock, date.value)
          )
      );

      res.forEach((stock) => {
        // eslint-disable-next-line no-console
        console.debug(
          '[Bulk Import]: Stock history purged.',
          stock.purgeStockHistory
        );
      });
    } catch (e) {
      loading.value = false;

      if (e instanceof Error) {
        props.store.error.setCurrentError(e.message);
      }
    }
  }

  loading.value = false;
  emit('submit');
}

function handleCancel() {
  if (hasPreviousStep.value) {
    step.value -= 1;
    return;
  }

  emit('cancel');
}

watchEffect(() => {
  if (props.show) {
    selected.value = [];
    step.value = STEP.SELECT_STOCKS;
    date.value = new Date().toISOString().slice(0, 10);
  }
});
</script>

<template>
  <modal-dialog
    :show="show"
    class="large destructive"
    title="Purge History"
    :submit-label="submitLabel"
    :cancel-label="cancelLabel"
    :can-submit="canSubmit"
    :can-cancel="canCancel"
    @submit="handleSubmit"
    @cancel="handleCancel"
  >
    <template #submitLabel="{ label }">
      <loading-label :show="loading">
        {{ loading ? 'Purging...' : label }}
      </loading-label>
    </template>

    <template v-if="step === STEP.SELECT_STOCKS">
      <h2>Step 1: Select Stocks</h2>

      <div class="stock-list">
        <stock-list v-model="selected" :stocks="stocks" />
      </div>
    </template>

    <template v-if="step === STEP.DATE">
      <h2>Step 2: Select Purge Date</h2>

      <v-input
        v-model="date"
        type="date"
        class="purge-date-input"
        label="Purge Date"
        required
      >
        <template #help>
          Choose a date to use as a cutoff for the purge. Specify today's date
          to purge everything up to today's date.
        </template>
      </v-input>
    </template>

    <template v-if="step === STEP.CONFIRM">
      <h2>Are you sure?</h2>
      <p>
        You are purging history for
        <strong>{{ selected.length }}</strong> stock(s) up to
        {{ new Date(date).toLocaleDateString() }}. This action cannot be undone.
      </p>
    </template>
  </modal-dialog>
</template>

<style scoped>
h2 {
  margin-bottom: 0.5em;
}

.stock-list {
  border: 1px solid hsl(var(--clr-neutral-500));
  border-radius: var(--border-radius);
}
</style>

<style>
.purge-date-input input {
  width: 12rem;
  font-size: 1em;
}
</style>
