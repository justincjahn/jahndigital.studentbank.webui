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
        ref="input"
        :name="inputName"
        :model-value="val"
        :options="options"
        :value="value"
        v-bind="$attrs"
        @update:modelValue="x => update(x)"
      />
    </template>
  </base-input>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import Period from '@/enums/Period';
import BaseInput, { validationFunc } from './BaseInput.vue';
import BaseSelect from './BaseSelect.vue';

const options = Object.keys(Period);
const value = (option: PeriodStrings) => Period[option] ?? 'UNKNOWN';

export default defineComponent({
  components: {
    BaseInput,
    BaseSelect,
  },
  inheritAttrs: false,
  props: {
    id: {
      type: String,
      default: undefined,
    },
    name: {
      type: String,
      default: undefined,
    },
    modelValue: {
      type: String,
      default: '',
    },
    helpText: {
      type: String,
      default: '',
    },
    error: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    validator: {
      type: Function as PropType<validationFunc>,
      default: undefined,
    },
  },
  emits: [
    'update:modelValue',
    'update:error',
  ],
  setup() {
    const input = ref<typeof BaseSelect|null>(null);

    function openInput() {
      setTimeout(() => {
        if (!input.value) return;
        input.value.toggle();
      }, 10);
    }

    return {
      options,
      value,
      input,
      openInput,
    };
  },
});
</script>
