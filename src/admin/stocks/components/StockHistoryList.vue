<script setup lang="ts">
import type { GlobalStore } from '@/admin/common/stores/global';

import { computed } from 'vue';

import Money from '@/common/utils/Money';

const props = defineProps<{
  store: GlobalStore;
}>();

const loading = computed(() => props.store.stockHistory.loading.value);

const stockHistory = computed(() => props.store.stockHistory.history.value);

const totalPages = computed(() => props.store.stockHistory.totalPages.value);

const hasNextPage = computed(() => props.store.stockHistory.hasNextPage.value);

const hasPreviousPage = computed(
  () => props.store.stockHistory.hasPreviousPage.value
);

function fetchNext() {
  props.store.stockHistory.fetchNext();
}

function fetchPrevious() {
  props.store.stockHistory.fetchPrevious();
}
</script>

<template>
  <table :class="{ loading }">
    <thead>
      <tr>
        <th>Date</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="stockHistory.length === 0">
        <td colspan="2" class="help-text">No history is available...</td>
      </tr>
      <tr v-for="history in stockHistory" :key="history.id">
        <td>{{ new Date(history.dateChanged).toLocaleDateString() }}</td>
        <td>{{ Money.fromNumber(history.value) }}</td>
      </tr>
    </tbody>
  </table>

  <div v-if="totalPages > 1" class="pagination-buttons">
    <button type="button" :disabled="!hasPreviousPage" @click="fetchPrevious">
      Previous
    </button>
    <button type="button" :disabled="!hasNextPage" @click="fetchNext">
      Next
    </button>
  </div>
</template>
