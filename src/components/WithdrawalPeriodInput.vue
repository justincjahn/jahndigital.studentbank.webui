<script lang="ts">
import { validationFunc, Item, Search } from '@/types';
import { ref } from 'vue';
import Period from '@/enums/Period';
import BaseInput from './BaseInput.vue';
import BaseSelect from './BaseSelect.vue';

export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
const options = Object.keys(Period);
const value: Search = (obj: Item) => Period[obj as PeriodStrings] ?? 'UNKNOWN';

withDefaults(defineProps<{
  id?: string
  name?: string
  modelValue?: string|boolean
  helpText?: string
  error?: string
  label?: string
  required?: boolean
  validator?: validationFunc
}>(), {
  modelValue: '',
  helpText: '',
  error: '',
  label: '',
  required: false,
  validator: (): boolean => false,
});

defineEmits<{
  (event: 'update:modelValue', value: string|boolean): void
  (event: 'update:error', error: string|false): void
}>();

const shouldToggle = ref(false);

function openInput() {
  setTimeout(() => {
    shouldToggle.value = true;
  }, 10);
}
</script>

<template>
  <base-input
    v-bind="$props"
    @update:modelValue="x => $emit('update:modelValue', x)"
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="slotData">
      <slot :name="slotName" v-bind="slotData" />
    </template>

    <template #label="{ id: labelId, label: labelValue }">
      <label
        v-if="labelValue"
        :for="labelId"
        @click="openInput"
      >
        {{ labelValue }}
      </label>
    </template>

    <template #default="{ modelValue: val, update, inputName }">
      <base-select
        :id="id"
        :name="inputName"
        :model-value="val.toString()"
        v-model:shouldToggle="shouldToggle"
        :options="options"
        :value="value"
        v-bind="$attrs"
        @update:modelValue="x => update(x?.toString() ?? '')"
      />
    </template>
  </base-input>
</template>
