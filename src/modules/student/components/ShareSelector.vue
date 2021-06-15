<template>
  <base-select
    prompt="Select a share..."
    class="share-selector"
    :options="shares"
    :value="value"
    :model-value="modelValue"
    @update:modelValue="update"
  />
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';

// Components
import BaseSelect, { Search } from '@/components/BaseSelect.vue';

// Stores
import userStore from '@/store/user';

export default defineComponent({
  components: {
    BaseSelect,
  },
  props: {
    shares: {
      type: Object as PropType<Share[]>,
      default: [] as Share[],
    },
    modelValue: {
      type: Object as PropType<Share|null>,
      default: null,
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup(props, { emit }) {
    const accountNumber = computed(() => userStore.id.value.toString().padStart(10, '0'));

    // Returns the name of the share to the base-select component
    const value: Search = (x) => {
      if (x === null) return 'Unknown';
      if (typeof x !== 'object') return 'Unknown';

      const balance = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(x.balance);

      return `${x.shareType?.name ?? 'Unknown'} (${accountNumber.value}S${x.id}) ${balance}`;
    };

    function update(share: Share) {
      emit('update:modelValue', share);
    }

    return {
      value,
      update,
    };
  },
});
</script>
