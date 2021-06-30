<template>
  <div class="stocks-index">
    <nav class="stocks-index__toolbar">
      <button
        type="button"
        @click="toggleNewStockModal"
      >
        New Stock
      </button>
      <button
        type="button"
        :disabled="isLinked || !selected"
        @click="handleLink"
      >
        Link Selected
      </button>
      <button
        type="button"
        :disabled="!isLinked || !selected"
        @click="handleUnlink"
      >
        Unlink Selected
      </button>
      <button
        type="button"
        :disabled="!selected || isLinked"
        @click="handleDelete"
      >
        Delete Selected
      </button>
    </nav>
    <div class="stocks-index__body">
      <div class="stocks-index__body__main-panel">
        <section>
          <h2>Linked</h2>

          <p class="help-text">
            Linked stocks are available for students in the instance to view, buy, and sell.
          </p>

          <stock-list
            :selected="selected"
            :store="globalStore"
            @stock-dblclick="handleStockDoubleClick"
            @stock-click="handleStockClick"
          />
        </section>

        <section>
          <h2>Available</h2>

          <p class="help-text">
            Available stocks are globally-created stocks that can be linked to the selected instance.
          </p>

          <stock-list
            :selected="selected"
            :available="true"
            :store="globalStore"
            @stock-dblclick="handleStockDoubleClick"
            @stock-click="handleStockClick"
          />
        </section>
      </div>
      <div class="stocks-index__body__sidebar">
        <section class="stocks-index__body__sidebar__edit-form">
          <h2>Update</h2>
          <edit-stock-form
            :selected="selected"
            :loading="updateStockPosting"
            @submit="handleUpdateStock"
          />
        </section>

        <section class="stocks-index__body__sidebar__history">
          <h2>History</h2>
          <stock-history-list :selected="selected" />
        </section>
      </div>
    </div>
  </div>

  <suspense>
    <new-stock-modal
      :show="showNewStockModal"
      :loading="newStockPosting"
      @ok="handleNewStockModalOk"
      @cancel="toggleNewStockModal"
    />
  </suspense>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

// Utils
import injectStrict from '@/utils/injectStrict';
import { GLOBAL_STORE } from '../../symbols';

// Components
import StockList from '../components/StockList.vue';
import StockHistoryList from '../components/StockHistoryList.vue';
import EditStockForm from '../components/EditStockForm.vue';

// Routes
import RouteNames from '../routeNames';

export default defineComponent({
  components: {
    StockList,
    StockHistoryList,
    NewStockModal: defineAsyncComponent(() => import('../components/NewStockModal.vue')),
    EditStockForm,
  },
  setup() {
    const router = useRouter();
    const globalStore = injectStrict(GLOBAL_STORE);
    const showNewStockModal = ref(false);
    const newStockPosting = ref(false);
    const updateStockPosting = ref(false);

    const isLinked = computed(() => {
      if (!globalStore.stock.selected.value) return false;
      const instances = (globalStore.stock.selected.value?.stockInstances ?? []).map((x) => x.instanceId);
      const instanceId = globalStore.instance.selected.value?.id ?? -1;
      return instances.includes(instanceId);
    });

    /**
     * Toggle the selected stock on click.
     */
    function handleStockClick(stock: Stock) {
      if (globalStore.stock.selected.value === stock) {
        globalStore.stock.selected.value = null;
      } else {
        globalStore.stock.selected.value = stock;
      }
    }

    /**
     * Route to the stock details page on double-click.
     */
    function handleStockDoubleClick(stock: Stock) {
      router.push({
        name: RouteNames.stockDetails,
        params: {
          id: stock.id,
        },
      });
    }

    /**
     * Toggle display of the New Stock Modal
     */
    function toggleNewStockModal() {
      showNewStockModal.value = !showNewStockModal.value;
    }

    /**
     * Attempt to create a new Stock when the user clicks Ok on the New Stock Modal.
     */
    async function handleNewStockModalOk(req: NewStockRequest) {
      newStockPosting.value = true;
      try {
        await globalStore.stock.create(req);
        toggleNewStockModal();
      } catch (e) {
        globalStore.error.setCurrentError(e?.message ?? e);
      } finally {
        newStockPosting.value = false;
      }
    }

    /**
     * Attempt to update a Stock when the user clicks Save on the Update Stock Form.
     */
    async function handleUpdateStock(req: UpdateStockRequest) {
      updateStockPosting.value = true;
      try {
        await globalStore.stock.update(req);
      } catch (e) {
        globalStore.error.setCurrentError(e?.message ?? e);
      } finally {
        updateStockPosting.value = false;
      }
    }

    /**
     * Attempt to link the currently selected stock to the currently selected instance.
     */
    async function handleLink() {
      if (!globalStore.instance.selected.value) return;
      if (!globalStore.stock.selected.value) return;

      try {
        await globalStore.stock.link({
          stockId: globalStore.stock.selected.value.id,
          instanceId: globalStore.instance.selected.value.id,
        });

        globalStore.stock.selected.value = null;
      } catch (e) {
        globalStore.error.setCurrentError(e?.message ?? e);
      }
    }

    /**
     * Attempt to unlink the currently selected stock from the currently selected instance.
     */
    async function handleUnlink() {
      if (!globalStore.instance.selected.value) return;
      if (!globalStore.stock.selected.value) return;

      try {
        await globalStore.stock.unlink({
          stockId: globalStore.stock.selected.value.id,
          instanceId: globalStore.instance.selected.value.id,
        });

        globalStore.stock.selected.value = null;
      } catch (e) {
        globalStore.error.setCurrentError(e?.message ?? e);
      }
    }

    /**
     * Attempt to soft-delete the currently selected stock.
     */
    async function handleDelete() {
      if (!globalStore.stock.selected.value) return;

      try {
        await globalStore.stock.remove(globalStore.stock.selected.value);
        globalStore.stock.selected.value = null;
      } catch (e) {
        globalStore.error.setCurrentError(e?.message ?? e);
      }
    }

    return {
      showNewStockModal,
      newStockPosting,
      updateStockPosting,
      globalStore,
      selected: globalStore.stock.selected,
      isLinked,
      toggleNewStockModal,
      handleNewStockModalOk,
      handleUpdateStock,
      handleStockClick,
      handleStockDoubleClick,
      handleLink,
      handleUnlink,
      handleDelete,
    };
  },
});
</script>

<style lang="scss">
  .stocks-index {
    flex-grow: 1; // Fill the whole height of <main/>

    display: flex;
    flex-direction: column;

    &__toolbar {
      position: sticky;
      top: 0px;
      padding: 1em;
      background-color: colorStep(secondary);
    }

    &__body {
      flex-grow: 1; // Fill the whole height of .stock-index
      margin: 1rem 1rem 0 1rem;

      display: flex;
      flex-direction: column;
      & > * { width: 100%; } // Even columns

      &__sidebar {
        display: flex;
        flex-direction: column;

        &__edit-form {
          margin-bottom: 1em;

          form {
            @include round-border;
            background-color: colorStep(secondary, $step: 0, $darken: false);
            padding: 1em;
          }
        }

        &__history {
          flex-grow: 1; // Fill the whole height of __sidebar
          margin-bottom: 1rem;

          display: flex;
          flex-direction: column;

          h2 { margin-bottom: 0.5em; }

          .stock-history {
            @include round-border;
            flex-grow: 1;

            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
        }
      }

      .stock-list {
        margin: 1rem 0;
      }
    }

    @media screen and (min-width: 900px) {
      &__body {
        flex-direction: row;
        gap: 1.5rem;

        &__sidebar {
          &__edit-form {
            h2 { display: none; }
          }
        }
      }
    }
  }
</style>
