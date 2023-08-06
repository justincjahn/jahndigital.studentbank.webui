<script setup lang="ts">
// Types
import type { GlobalStore } from '@/admin/common/stores/global';
import type { Stock } from '@/common/services/stock';

// Core
import { defineAsyncComponent, computed, ref, watchEffect } from 'vue';

// Stores
import { setup as setupStockStore } from '@/admin/common/stores/stock';

// Components
import ModalDialog from '@/common/components/ModalDialog.vue';
import LoadingLabel from '@/common/components/LoadingLabel.vue';

import {
  buildFormData,
  StockAddEditForm,
} from '@/admin/stocks/components/StockAddEditForm';

const StockList = defineAsyncComponent(
  () => import('@/admin/stocks/components/StockList.vue')
);

const props = defineProps<{
  store: GlobalStore;
  show: boolean;
}>();

defineEmits<{
  (event: 'submit'): void;
}>();

const stockStore = setupStockStore();

const instanceId = computed(
  () => props.store.instance.selected.value?.id ?? -1
);

const loading = computed(
  () => stockStore.loading.value || props.store.stock.loading.value
);

const formData = buildFormData();
formData.rawDescription = '';

const formLoading = ref(false);
const formValid = ref(false);
const formReset = ref(false);

const canAdd = computed(
  () => formValid.value && !formLoading.value && !loading.value
);

const unlinkedStocks = computed(() => {
  return stockStore.stocks.value.filter(
    (stock) =>
      stock.stockInstances.findIndex(
        (x) => x.instanceId === instanceId.value
      ) === -1
  );
});

const selected = ref<Stock[]>([]);

const canLink = computed(() => selected.value.length > 0);

async function handleAdd() {
  if (!canAdd.value) return;

  try {
    await stockStore.create({
      name: formData.name,
      symbol: formData.symbol,
      currentValue: formData.currentValue.getAmount(),
      rawDescription: formData.rawDescription,
    });

    formReset.value = true;

    await stockStore.fetch({
      cache: false,
    });
  } catch (e) {
    if (e instanceof Error) {
      props.store.error.setCurrentError(e.message);
    }
  }
}

async function handleLink() {
  if (!canLink.value) return;
  if (instanceId.value === -1) return;

  try {
    const { link } = props.store.stock;

    const promises = selected.value.map((stock) => {
      return link({
        stockId: stock.id,
        instanceId: instanceId.value,
      });
    });

    await Promise.all(promises);

    selected.value = [];

    await stockStore.fetch({
      cache: false,
    });
  } catch (e) {
    if (e instanceof Error) {
      props.store.error.setCurrentError(e.message);
    }
  }
}

const showConfirmationDialog = ref(false);

function handleShowConfirmRemove() {
  showConfirmationDialog.value = true;
}

function handleCancelRemove() {
  showConfirmationDialog.value = false;
}

async function handleRemove() {
  if (!canLink.value) return;
  if (instanceId.value === -1) return;

  try {
    const { remove } = props.store.stock;

    const promises = selected.value.map((stock) => {
      return remove(stock);
    });

    await Promise.all(promises);

    selected.value = [];

    await stockStore.fetch({
      cache: false,
    });
  } catch (e) {
    if (e instanceof Error) {
      props.store.error.setCurrentError(e.message);
    }
  } finally {
    showConfirmationDialog.value = false;
  }
}

watchEffect(() => {
  if (props.show) {
    selected.value = [];

    stockStore.fetch({
      cache: false,
    });
  }
});
</script>

<template>
  <modal-dialog
    :show="show"
    class="large"
    title="Manage Stocks"
    submit-label="Close"
    @submit="$emit('submit')"
  >
    <div class="stocks-form">
      <h2>Create a New Stock</h2>

      <form @submit.prevent="handleAdd">
        <stock-add-edit-form
          v-model="formData"
          v-model:loading="formLoading"
          v-model:valid="formValid"
          v-model:should-reset="formReset"
        />

        <button type="submit" class="primary" :disabled="!canAdd">
          <loading-label :show="formLoading || loading">
            {{
              formLoading
                ? 'Loading...'
                : stockStore.loading.value
                ? 'Adding...'
                : 'Add'
            }}
          </loading-label>
        </button>
      </form>
    </div>

    <div class="stocks-available">
      <h2>Available to Link</h2>
      <suspense>
        <stock-list
          v-model="selected"
          :stocks="unlinkedStocks"
          :class="{ loading }"
        />
      </suspense>

      <button
        type="button"
        class="primary"
        :disabled="!canLink"
        @click="handleLink"
      >
        <loading-label :show="loading">
          {{ loading ? 'Loading...' : 'Link' }}
        </loading-label>
      </button>

      <button
        type="button"
        class="destructive"
        :disabled="!canLink"
        @click="handleShowConfirmRemove"
      >
        Delete
      </button>
    </div>
  </modal-dialog>

  <modal-dialog
    :show="showConfirmationDialog"
    class="destructive"
    title="Delete Stocks"
    cancel-label="Cancel"
    submit-label="Delete"
    @submit="handleRemove"
    @cancel="handleCancelRemove"
  >
    Are you sure you want to delete {{ selected.length }} stock(s)?
  </modal-dialog>
</template>

<style scoped>
.stocks-form,
.stocks-available {
  padding: 1em;
  border: 1px solid hsl(var(--clr-neutral-500));
  border-radius: var(--border-radius);
}

.stocks-form {
  margin-bottom: 1rem;
}

.stocks-form button[type='submit'] {
  width: 100%;
  height: 2.5em;
  margin-top: 1.5em;
}

.stocks-available button[type='button'] {
  width: 100%;
  height: 2.5em;
  margin-top: 1.5em;
}

.loading {
  opacity: 0.4;
}
</style>
