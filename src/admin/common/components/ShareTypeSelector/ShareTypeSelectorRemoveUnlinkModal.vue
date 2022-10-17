<script lang="ts" setup>
import { ref, computed } from 'vue';
import type { GlobalStore } from '@/admin/common/stores/global';
import type { ShareType } from '@/admin/common/services/shareType';

// Components
import ShareTypeMultiSelector from '@/admin/common/components/ShareTypeMultiSelector.vue';

const props = defineProps<{
  store: GlobalStore;
}>();

// An array of selected share types
const selected = ref<ShareType[]>([]);

// True when unlinking
const unlinking = ref(false);

// The currently active instance
const currentInstance = computed(() => props.store.instance.selected.value);

// True if the store is loading or the user is waiting for an unlink to finish
const loading = computed(
  () => props.store.shareType.loading.value || unlinking.value
);

// The current share type store
const shareTypeStore = computed(() => props.store.shareType);

// A list of share types held in the store
const shareTypes = computed(() => shareTypeStore.value.shareTypes.value);

/**
 * Called when the user clicks the unlink button or submits the form
 */
async function handleUnlink() {
  if (!currentInstance.value) return;
  if (selected.value.length === 0) return;

  const instanceId = currentInstance.value.id;
  unlinking.value = true;

  try {
    const promises = selected.value.map((shareType) =>
      shareTypeStore.value.unlink({
        instanceId,
        shareTypeId: shareType.id,
      })
    );

    await Promise.all(promises);
  } catch (e) {
    if (!(e instanceof Error)) return;
    props.store.error.setCurrentError(e.message);
  } finally {
    unlinking.value = false;
    await shareTypeStore.value.fetch({ cache: false });
    selected.value = [];
  }
}
</script>

<template>
  <form class="stsrum" @submit.prevent="handleUnlink">
    <share-type-multi-selector
      v-model="selected"
      :loading="loading"
      :options="shareTypes"
    />

    <button type="submit" class="primary">Unlink</button>
  </form>
</template>

<style>
.stsrum {
  padding: 1em;
  border: 1px solid hsl(var(--clr-neutral-500));
  border-radius: var(--border-radius);
}

.stsrum button[type='submit'] {
  width: 100%;
  margin: 0;
  margin-top: 2em;
}
</style>
