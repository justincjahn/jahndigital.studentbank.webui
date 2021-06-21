<template>
  <div class="sttb">
    <div
      v-for="(item, index) in modelValue"
      :key="index"
      class="sttb__fieldset"
    >
      <share-type-selector
        v-model="item.shareType"
        :share-type-store="shareTypeStore"
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
import { defineComponent, PropType } from 'vue';

// Components
import BaseCurrencyInput from '@/components/BaseCurrencyInput.vue';
import ShareTypeSelector from '@/modules/admin/components/ShareTypeSelector.vue';

// Stores
import { ShareTypeStore } from '@/modules/admin/stores/shareType';

export default defineComponent({
  components: {
    ShareTypeSelector,
    BaseCurrencyInput,
  },
  props: {
    modelValue: {
      type: Object as PropType<ShareTypeTemplate[]>,
      required: true,
    },
    shareTypeStore: {
      type: Object as PropType<ShareTypeStore>,
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
