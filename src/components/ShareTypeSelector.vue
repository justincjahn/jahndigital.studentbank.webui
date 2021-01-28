<template>
  <Select
    :options="shareTypes"
    :key="(x) => x ? x.id : null"
    :value="(x) => x ? x.name : null"
    :default="selectedValue"
    msg="Select a Share Type"
    @select="selectShareType"
  />
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue';
import Select from '@/components/Select.vue';
import gqlShareTypes from '@/graphql/shareTypes.query.gql';
import instanceStore from '@/store/instance';
import errorStore from '@/store/error';
import Apollo from '@/services/Apollo';

export default defineComponent({
  components: {
    Select,
  },
  emits: [
    'select',
  ],
  props: {
    selectedValue: {
      required: true,
    },
  },
  setup(_, { emit }) {
    const shareTypes = ref<ShareType[]>([]);

    // Fetch share types mapped to the currently selected instance
    watchEffect(async () => {
      if (instanceStore.selected.value !== null) {
        try {
          const res = await Apollo.query<ShareTypeResponse>({
            query: gqlShareTypes,
          });

          if (res && res.data) {
            const filtered = res.data.shareTypes.nodes.filter(
              (x) => x.shareTypeInstances.findIndex((y) => y.instanceId === instanceStore.selected.value?.id) >= 0,
            );

            shareTypes.value = filtered;
          }
        } catch (e) {
          errorStore.setCurrentError(e?.Message ?? e);
        }
      } else {
        shareTypes.value = [];
      }
    });

    /**
     * When a Share Type is selected, emit it
     */
    function selectShareType(item: ShareType) {
      emit('select', item);
    }

    return {
      shareTypes,
      selectShareType,
    };
  },
});
</script>
