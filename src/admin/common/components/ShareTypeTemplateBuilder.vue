<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';

import type { IMoney } from '@/common/utils/Money';
import type { GlobalStore } from '@/admin/common/stores/global';
import type { ShareType } from '@/admin/common/services/shareType';
import Money from '@/common/utils/Money';
import { VCurrency } from '@/common/components/inputs';

export interface ShareTypeTemplate {
  shareType: ShareType | null;
  initialDeposit: IMoney;
  error: string;
}

const ShareTypeSelector = defineAsyncComponent(
  async () =>
    (await import('@/admin/common/components/ShareTypeSelector'))
      .ShareTypeSelector
);

const props = defineProps<{
  modelValue: ShareTypeTemplate[];
  store: GlobalStore;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: ShareTypeTemplate[]): void;
}>();

function handleAdd() {
  const template = [...props.modelValue];

  template.push({
    shareType: null,
    initialDeposit: Money.fromNumber(0),
    error: '',
  });

  emit('update:modelValue', template);
}

function handleRemove(index: number) {
  const template = [...props.modelValue];
  template.splice(index, 1);
  emit('update:modelValue', template);
}
</script>

<template>
  <div class="sttb">
    <div
      v-for="(item, index) in props.modelValue"
      :key="index"
      class="sttb__fieldset"
    >
      <share-type-selector v-model="item.shareType" :store="props.store" />

      <v-currency
        v-model="item.initialDeposit"
        v-model:error="item.error"
        :allow-negative="false"
        class="inline"
      />

      <button type="button" @click="handleRemove(index)">Remove</button>

      <span v-if="item.error" class="error">
        {{ item.error }}
      </span>
    </div>

    <button type="button" @click="handleAdd">Add</button>
  </div>
</template>

<style scoped>
.sttb__fieldset {
  display: flex;
  flex-direction: row;
  gap: 0.5em;
  margin: 0.5em 0;
}

.sttb__fieldset .fieldset.inline {
  gap: 0;
}
</style>
