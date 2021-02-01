<template>
  <table class="share-type-list" :class="{ loading: loading }">
    <thead>
      <tr>
        <th></th>
        <th>Name</th>
        <th>Rate</th>
      </tr>
    </thead>
    <tbody v-if="shareTypes.length > 0">
      <tr
        v-for="s in shareTypes"
        :key="s.id"
        :class="{ selected: isSelected(s) }"
      >
        <td>
          <input type="checkbox" :checked="isSelected(s)" @click="select(s)" v-if="modelValue" />
        </td>
        <td @click="select(s)">{{s.name}}</td>
        <td @click="select(s)">{{s.dividendRate.toLocaleString('us', { style: 'percent', minimumFractionDigits: 2 })}}</td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="3" class="center">{{prompt}}</td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

/**
 * Allows multi-selection of a group of provided Share Types.
 */
export default defineComponent({
  props: {
    shareTypes: {
      type: Object as PropType<ShareType[]>,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: Object as PropType<ShareType[]>,
    },
    prompt: {
      type: String,
      default: 'No Share Types available...',
    },
  },
  setup(props, { emit }) {
    function isSelected(item: ShareType) {
      return (props.modelValue?.findIndex((x) => x.id === item.id) ?? -1) >= 0;
    }

    function select(item: ShareType) {
      if (isSelected(item)) {
        emit('update:modelValue', props.modelValue?.filter((x) => x.id !== item.id) ?? []);
      } else {
        emit('update:modelValue', [...props.modelValue ?? [], item]);
      }
    }

    return {
      isSelected,
      select,
    };
  },
});
</script>

<style lang="scss">
  .share-type-list {
    @include table($selectable: true);
  }
</style>
