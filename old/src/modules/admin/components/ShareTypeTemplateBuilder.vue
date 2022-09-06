<template>
  <div class="sttb">
    <div
      v-for="(item, index) in modelValue"
      :key="index"
      class="sttb__fieldset"
    >
      <share-type-selector
        v-model="item.shareType"
        :store="store"
      />

      <base-currency-input
        v-model="item.initialDeposit"
        v-model:error="item.error"
        :allow-negative="false"
        class="sttb__fieldset--currency"
      />

      <button @click="remove(index)">
        Remove
      </button>

      <span v-if="item.error" class="error">
        {{ item.error }}
      </span>
    </div>

    <button @click="add">
      Add
    </button>
  </div>
</template>
<script lang="ts">
import { defineComponent, defineAsyncComponent, PropType } from 'vue';

// Stores
import { GlobalStore } from '../stores/global';

export default defineComponent({
  components: {
    BaseCurrencyInput: defineAsyncComponent(() => import('@/components/BaseCurrencyInput.vue')),
    ShareTypeSelector: defineAsyncComponent(() => import('./ShareTypeSelector.vue')),
  },
  props: {
    modelValue: {
      type: Object as PropType<ShareTypeTemplate[]>,
      required: true,
    },
    store: {
      type: Object as PropType<GlobalStore>,
      required: true,
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup(props, { emit }) {
    /**
     * Add a new ShareTemplate to the list.
     */
    function add() {
      const template = [...props.modelValue];

      template.push({
        shareType: null,
        initialDeposit: '0.00',
        error: '',
      });

      emit('update:modelValue', template);
    }

    /**
     * Remove the specified ShareTypeTemplate from the list.
     */
    function remove(index: number) {
      const template = [...props.modelValue];
      template.splice(index, 1);
      emit('update:modelValue', template);
    }

    return {
      add,
      remove,
    };
  },
});
</script>

<style lang="scss">
  .sttb {
    &__fieldset--currency {
      margin-left: 0.25em;
    }
  }
</style>
