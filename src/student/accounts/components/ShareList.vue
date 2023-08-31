<script setup lang="ts">
import type { Share } from '@/common/services/share';
import type { GlobalStore } from '@/student/common/stores/global';
import ShareCard from './ShareCard.vue';

defineProps<{
  store: GlobalStore;
}>();

defineEmits<{
  (event: 'select', share: Share): void;
}>();
</script>

<template>
  <div class="share-list">
    <share-card
      v-for="share in store.share.shares.value"
      :key="share.id"
      :share="share"
      :selected="share.id === store.share.selected.value?.id"
      @click="$emit('select', share)"
    >
      <template #default>
        <slot :share="share" />
      </template>
    </share-card>
  </div>
</template>

<style scoped>
.share-list {
  display: flex;
  gap: 1rem;

  padding: 0.15rem;
  padding-bottom: 0.5rem;

  overflow-x: auto;
}

.share-list > div {
  flex-shrink: 0;
}

@media screen and (min-width: 50rem) {
  .share-list {
    flex-wrap: wrap;
  }
}
</style>
