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
import { defineComponent, ref, PropType, computed, onMounted, watch } from 'vue';
import Apollo from '@/services/Apollo';
import gqlShareTypes from '@/graphql/shareTypes.query.gql';
import theInstanceStore, { InstanceStore } from '@/store/instance';
import errorStore from '@/store/error';
import BaseSelect, { Search } from '@/components/BaseSelect.vue';

/**
 * A component that allows users to select a Share Type linked to the currently
 * selected instance.  A custom instanceStore may be passed in.  Alternatively,
 * a list of ShareType objects may be passed in and the store is ignored entirely.
 * When a selection is made, the v-model is updated via update:modelValue event.
 */
export default defineComponent({
  components: {
    BaseSelect,
  },
  props: {
    modelValue: {
      type: Object as PropType<ShareType|null>,
    },
    instanceStore: {
      type: Object as PropType<InstanceStore>,
    },
    shareTypes: {
      type: Array as PropType<ShareType[]>,
    },
  },
  setup(props, { emit }) {
    const shareTypes = ref<ShareType[]>([]);

    // Use either the provided shareTypes, or our own
    const options = computed<ShareType[]>({
      get: () => props.shareTypes ?? shareTypes.value,
      set: (items) => { shareTypes.value = items; },
    });

    // Use either the provided instanceStore or the global one.
    const instanceStore = computed<InstanceStore>(() => props.instanceStore ?? theInstanceStore);

    // Returns the name of the share type to the base-select component
    const value: Search = (x) => (typeof x === 'object' ? x?.name ?? x : x);

    // When an item is selected, update our parent
    function update(item: ShareType) { emit('update:modelValue', item); }

    // Fetch share types for the selected instance (provided or global).
    async function fetch() {
      try {
        const res = await Apollo.query<ShareTypeResponse>({
          query: gqlShareTypes,
          variables: {
            instanceId: instanceStore.value.selected.value?.id ?? -1,
          },
        });

        if (res && res.data) {
          shareTypes.value = res.data.shareTypes.nodes;
        }
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      }
    }

    // If we weren't given shareTypes from props, fetch our own from
    // the instanceStore (provided, or global).
    onMounted(() => {
      if (typeof props.shareTypes !== 'undefined') return;
      fetch();
    });

    // Watch the selected instance and fetch new share types if we aren't
    // hooked into shareTypes from props.
    watch(() => instanceStore.value.selected.value, () => {
      if (typeof props.shareTypes === 'undefined') fetch();
    });

    return {
      options,
      update,
      value,
    };
  },
});
</script>
