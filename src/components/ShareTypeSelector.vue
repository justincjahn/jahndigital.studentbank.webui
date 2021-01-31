<template>
  <base-select
    :options="options"
    :value="value"
    :modelValue="modelValue"
    @update:modelValue="update"
    prompt="Choose a share type..."
  />
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import theShareTypeStore, { ShareTypeStore } from '@/store/shareType';
import BaseSelect, { Search } from '@/components/BaseSelect.vue';

/**
 * A component that allows users to select a Share Type linked to the currently
 * selected instance.  A custom instanceStore may be passed in if using the global
 * instanceStore is not desired.
 */
export default defineComponent({
  components: {
    BaseSelect,
  },
  props: {
    modelValue: {
      type: Object as PropType<ShareType|null>,
    },
    shareTypeStore: {
      type: Object as PropType<ShareTypeStore>,
    },
  },
  setup(props, { emit }) {
    // Use either the provided shareTypeStore or the global one.
    const shareTypeStore = computed<ShareTypeStore>(() => props.shareTypeStore ?? theShareTypeStore);

    // Returns the name of the share type to the base-select component
    const value: Search = (x) => (typeof x === 'object' ? x?.name ?? x : x);

    // When an item is selected, update our parent
    function update(item: ShareType) { emit('update:modelValue', item); }

    return {
      options: shareTypeStore.value.shareTypes,
      update,
      value,
    };
  },
});
</script>
