<template>
  <base-select
    :options="options"
    :value="value"
    :model-value="modelValue"
    prompt="Choose a share type..."
    v-bind="$attrs"
    @update:modelValue="update"
  >
    <template #list="{ options, className, select }">
      <li
        v-for="option in options"
        :key="option.id"
        :class="className"
        @click="select(option)"
      >
        {{ option.name }}
      </li>
      <li class="select__items__divider">
        <hr />
      </li>
      <li
        :class="className"
        @click.prevent="startAdd"
      >
        Add...
      </li>
      <li
        :class="className"
        @click.prevent="startEdit"
      >
        Rename...
      </li>
      <li
        :class="className"
        @click.prevent="startDelete"
      >
        Delete...
      </li>
    </template>
  </base-select>

  <suspense>
    <add-link-modal
      :show="showAddLink"
      :share-type-store="store"
      @ok="startAdd"
    />
  </suspense>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, ref, computed, PropType } from 'vue';
import theShareTypeStore, { ShareTypeStore } from '@/store/shareType';
import BaseSelect, { Search } from '@/components/BaseSelect.vue';

enum ModalState {
  EDIT,
  DELETE,
}

/**
 * A component that allows users to select a Share Type linked to the currently
 * selected instance.  A custom instanceStore may be passed in if using the global
 * instanceStore is not desired.
 */
export default defineComponent({
  components: {
    BaseSelect,
    AddLinkModal: defineAsyncComponent(() => import(/* webpackChunkName: "st" */ '@/components/admin/ShareTypeAddLinkModal.vue')),
  },
  props: {
    modelValue: {
      type: Object as PropType<ShareType|null>,
      default: undefined,
    },
    shareTypeStore: {
      type: Object as PropType<ShareTypeStore>,
      default: undefined,
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup(props, { emit }) {
    const modalState = ref<ModalState>(ModalState.EDIT);

    const showAddLink = ref(false);

    // Use either the provided shareTypeStore or the global one.
    const shareTypeStore = computed<ShareTypeStore>(() => props.shareTypeStore ?? theShareTypeStore);

    // Returns the name of the share type to the base-select component
    const value: Search = (x) => (typeof x === 'object' ? x?.name ?? x : x);

    // When an item is selected, update our parent
    function update(item: ShareType) { emit('update:modelValue', item); }

    // Set the modal state to 'ADD' and show it
    function startAdd() { showAddLink.value = !showAddLink.value; }

    // Set the modal state to 'EDIT' and show it
    function startEdit() { modalState.value = ModalState.EDIT; }

    // Set the modal state to 'DELETE' and show it
    function startDelete() { modalState.value = ModalState.DELETE; }

    return {
      options: shareTypeStore.value.shareTypes,
      update,
      value,
      startAdd,
      startEdit,
      startDelete,
      showAddLink,
      store: shareTypeStore.value,
    };
  },
});
</script>
