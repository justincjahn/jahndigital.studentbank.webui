<template>
  <Select
      :options="GroupState.groups"
      :key="(x) => x ? x.id : null"
      :value="(x) => x ? x.name : null"
      :default="GroupState.selectedGroup"
      @select="(x) => GroupState.setSelectedGroup(x)"
    >
      <template v-slot:list="props">
        <li
          v-for="option in props.options"
          :key="option.id"
          :class="props.class"
          @click="props.select(option)"
        >
          {{ option.name }}
        </li>
        <li class="select__items__divider"><hr /></li>
        <li :class="props.class" @click.prevent>
          Add...
        </li>
        <li :class="props.class" @click.prevent>
          Rename...
        </li>
        <li :class="props.class" @click.prevent>
          Delete...
        </li>
      </template>
    </Select>
</template>

<script lang="ts">
import Group from '@/@types/Group';
import Select from '@/components/Select.vue';
import GlobalState from '@/store/modules/global';
import InstanceState from '@/store/modules/instance';
import GroupState from '@/store/modules/group';
import { defineComponent, ref, watchEffect } from 'vue';

export default defineComponent({
  components: {
    Select,
  },
  setup() {
    watchEffect(() => {
      if (InstanceState.selectedInstance !== null) {
        GroupState.fetchGroups({
          instanceId: InstanceState.selectedInstance.id,
        });
      }
    });

    return {
      GroupState,
    };
  },
});
</script>

<style lang="scss" scoped>
  .select__items__divider {
    height: auto;
    line-height: 0;

    & hr {
      border: none;
      border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    }
  }
</style>
