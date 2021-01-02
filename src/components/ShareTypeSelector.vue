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
import InstanceStore from '@/store/modules/instance';
import GlobalStore from '@/store/modules/global';
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
      if (InstanceStore.selectedInstance !== null) {
        try {
          const res = await Apollo.query<ShareTypeResponse>({
            query: gqlShareTypes,
          });

          if (res && res.data) {
            const filtered = res.data.shareTypes.nodes.filter(
              (x) => x.shareTypeInstances.findIndex((y) => y.instanceId === InstanceStore.selectedInstance?.id) >= 0,
            );

            shareTypes.value = filtered;
          }
        } catch (e) {
          GlobalStore.setCurrentError(e?.Message ?? e);
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
