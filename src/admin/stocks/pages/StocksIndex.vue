<script setup lang="ts">
import { defineAsyncComponent, ref, computed } from 'vue';

// Utils
import injectStrict from '@/common/utils/injectStrict';
import { GLOBAL_STORE } from '@/admin/symbols';

// Components
import {
  buildFormData,
  StockAddEditForm,
} from '@/admin/stocks/components/StockAddEditForm';

import LoadingLabel from '@/common/components/LoadingLabel.vue';

const StockList = defineAsyncComponent(
  () => import('@/admin/stocks/components/StockList.vue')
);

const StockHistoryList = defineAsyncComponent(
  () => import('@/admin/stocks/components/StockHistoryList.vue')
);

const ManageStocksModal = defineAsyncComponent(
  () => import('@/admin/stocks/components/ManageStocksModal.vue')
);

const PurgeHistoryModal = defineAsyncComponent(
  () => import('@/admin/stocks/components/PurgeHistoryModal.vue')
);

enum ModalState {
  ADD,
  PURGE,
}

const globalStore = injectStrict(GLOBAL_STORE);
const modalState = ref<ModalState | null>(null);
const formData = buildFormData();
const formValid = ref(true);
const formDirty = ref(false);

const instanceId = computed(
  () => globalStore.instance.selected.value?.id ?? -1
);

const loading = computed(() => globalStore.stock.loading.value);

const selected = computed({
  get: () => globalStore.stock.selected.value,
  set(value) {
    globalStore.stock.selected.value = value;
  },
});

async function handleUnlink() {
  if (selected.value === null) return;
  if (instanceId.value === -1) return;

  try {
    await globalStore.stock.unlink({
      stockId: selected.value.id,
      instanceId: instanceId.value,
    });
  } catch (e) {
    if (e instanceof Error) {
      globalStore.error.setCurrentError(e.message);
    }
  }
}

async function handleEdit() {
  if (selected.value === null) return;
  if (!formValid.value) return;

  try {
    await globalStore.stock.update({
      id: formData.id,
      name: formData.name,
      symbol: formData.symbol,
      currentValue: formData.currentValue.getAmount(),
      rawDescription: formData.rawDescription,
    });
  } catch (e) {
    if (e instanceof Error) {
      globalStore.error.setCurrentError(e.message);
    }
  }
}

globalStore.stock.fetch({
  cache: false,
});
</script>

<template>
  <div class="sub-menu">
    <div class="tool-strip container">
      <button type="button" @click="modalState = ModalState.ADD">
        Manage Stocks
      </button>

      <button type="button" @click="modalState = ModalState.PURGE">
        Purge History
      </button>

      <button type="button" :disabled="selected === null" @click="handleUnlink">
        Unlink
      </button>
    </div>
  </div>

  <section class="container section flex-group">
    <div class="flow flex-100">
      <suspense>
        <stock-list
          v-model="selected"
          :stocks="globalStore.stock.stocks.value"
          :class="{ loading }"
        />
      </suspense>
    </div>

    <div class="flow flex-100">
      <form
        class="edit-form | card flow"
        data-card-full
        @submit.prevent="handleEdit"
      >
        <h2 class="size-l">Update</h2>

        <stock-add-edit-form
          v-model="formData"
          v-model:valid="formValid"
          v-model:dirty="formDirty"
          :selected="selected"
        />

        <button
          type="submit"
          class="primary | width-100"
          data-button-type="chonky"
          :disabled="!formValid || !formDirty"
        >
          <loading-label :show="loading">
            {{ loading ? 'Loading...' : 'Update' }}
          </loading-label>
        </button>
      </form>

      <div class="card | flow" data-card-full>
        <h2 class="size-l">History</h2>

        <suspense>
          <stock-history-list :store="globalStore" />
        </suspense>
      </div>
    </div>
  </section>

  <suspense>
    <manage-stocks-modal
      :show="modalState === ModalState.ADD"
      :store="globalStore"
      @submit="modalState = null"
    />
  </suspense>

  <suspense>
    <purge-history-modal
      :show="modalState === ModalState.PURGE"
      :store="globalStore"
      @cancel="modalState = null"
      @submit="modalState = null"
    />
  </suspense>
</template>
