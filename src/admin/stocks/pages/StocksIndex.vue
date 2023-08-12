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
  <div class="sub-menu tool-strip">
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

  <section class="main-content">
    <div class="main-panel">
      <h2>Linked</h2>

      <suspense>
        <stock-list
          v-model="selected"
          :stocks="globalStore.stock.stocks.value"
          :class="{ loading }"
        />
      </suspense>
    </div>

    <div class="sidebar">
      <h2>Update</h2>

      <form class="edit-form" @submit.prevent="handleEdit">
        <stock-add-edit-form
          v-model="formData"
          v-model:valid="formValid"
          v-model:dirty="formDirty"
          :selected="selected"
        />

        <button
          type="submit"
          class="primary"
          :disabled="!formValid || !formDirty"
        >
          <loading-label :show="loading">
            {{ loading ? 'Loading...' : 'Update' }}
          </loading-label>
        </button>
      </form>

      <div class="stock-history">
        <h2>History</h2>

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

<style scoped>
.main-content {
  display: flex;
}

.main-panel {
  padding: 1rem;
  width: 100%;
}

.sidebar {
  padding: 1rem;
  flex-grow: 1;
}

.edit-form {
  margin-bottom: 1rem;
}

.edit-form,
.stock-history {
  display: block;
  padding: 1rem;
  border: 1px solid hsl(var(--clr-neutral-500));
  border-radius: var(--border-radius);
}

.edit-form button[type='submit'] {
  width: 100%;
  margin-top: 1em;
  height: 2.5em;
}

@media screen and (min-width: 50em) {
  .main-content {
    flex-direction: row;
  }

  .main-panel {
    max-width: clamp(15rem, 30rem, 60cqi);
  }
}
</style>
