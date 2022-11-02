<script lang="ts" setup>
import type { GlobalStore } from '@/admin/common/stores/global';
import type { ShareType } from '@/admin/common/services/shareType';
import { ref, computed, watchEffect } from 'vue';
import { setup as setupShareTypeStore } from '@/admin/common/stores/shareType';
import ShareTypeMultiSelector from '@/admin/common/components/ShareTypeMultiSelector.vue';
import ShareTypeAddEditForm from './ShareTypeAddEditForm.vue';
import { buildFormData } from './useShareTypeForm';

const props = defineProps<{
  selected: ShareType | null;
  valid: boolean;
  store: GlobalStore;
  show: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:valid', value: boolean): void;
}>();

const currentInstance = computed(() => props.store.instance.selected.value);

// Use our own store to fetch all available share types instead of those
/// only for the currently selected instance.
const shareTypeStore = setupShareTypeStore();

const selected = ref<ShareType[]>([]);

const loading = computed(() => {
  if (shareTypeStore.loading.value) return true;
  return false;
});

const shareTypes = computed(() => {
  const instanceId = currentInstance.value?.id ?? -1;

  const filtered = shareTypeStore.shareTypes.value.filter(
    (shareType) =>
      !shareType.shareTypeInstances.find(
        (instance) => instance.instanceId === instanceId
      )
  );

  return filtered;
});

const valid = computed({
  get: () => props.valid,
  set: (value) => emit('update:valid', value),
});

const formData = buildFormData();

async function handleAdd() {
  try {
    const data = {
      name: formData.name,
      dividendRate: formData.dividendRate.getRate(),
      withdrawalLimitCount: +formData.withdrawalLimitCount,
      withdrawalLimitPeriod: formData.withdrawalLimitPeriod,
      withdrawalLimitShouldFee: formData.withdrawalLimitShouldFee,
      withdrawalLimitFee: formData.withdrawalLimitFee.getAmount(),
    };

    await shareTypeStore.create(data);
    Object.assign(formData, buildFormData());
  } catch (e) {
    if (!(e instanceof Error)) return;
    props.store.error.setCurrentError(e.message);
  }
}

async function handleLink() {
  if (!currentInstance.value) return;
  const instanceId = currentInstance.value.id;

  try {
    const promises = selected.value.map((shareType) =>
      props.store.shareType.link({
        shareTypeId: shareType.id,
        instanceId,
      })
    );

    await Promise.all(promises);
    await shareTypeStore.fetch({ cache: false });
  } catch (e) {
    if (!(e instanceof Error)) return;
    props.store.error.setCurrentError(e.message);
  }
}

watchEffect(() => {
  if (props.show) {
    shareTypeStore.fetch({ cache: false });
  }
});
</script>

<template>
  <form class="stsalm" @submit.prevent="handleAdd">
    <share-type-add-edit-form v-model="formData" v-model:valid="valid" />
    <button type="submit" class="primary">Create</button>
  </form>

  <form class="stsalm" @submit.prevent="handleLink">
    <share-type-multi-selector
      v-model="selected"
      :options="shareTypes"
      :loading="loading"
    />

    <button type="submit" class="primary">Link</button>
  </form>
</template>

<style>
.stsalm {
  margin: 1em;
  padding: 1em;
  border: 1px solid hsl(var(--clr-neutral-500));
  border-radius: var(--border-radius);
}

.stsalm button[type='submit'] {
  width: 100%;
  margin: 0;
  margin-top: 2em;
}
</style>
