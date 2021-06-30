<template>
  <base-select
    prompt="Select a share type..."
    class="share-type-selector"
    v-bind="$attrs"
    :options="options"
    :value="value"
    :model-value="modelValue"
    @update:modelValue="update"
  >
    <template #list="{ options, className, select, selected }">
      <li
        v-for="option in options"
        :key="option.id"
        :class="[className, selected(option)]"
        @click="select(option)"
      >
        {{ option.name }}
      </li>
      <li class="select__items__divider">
        <hr />
      </li>
      <li
        :class="className"
        @click.prevent="toggleAddLinkModal"
      >
        Add...
      </li>
      <li
        :class="className"
        @click.prevent="toggleEditModal"
      >
        Edit...
      </li>
      <li
        :class="className"
        @click.prevent="toggleRemoveLinkModal"
      >
        Delete...
      </li>
    </template>
  </base-select>

  <suspense>
    <add-link-modal
      :show="showAddLink"
      :store="store"
      @ok="toggleAddLinkModal"
    />
  </suspense>

  <suspense>
    <remove-unlink-modal
      :show="showRemoveLink"
      :store="store"
      @ok="toggleRemoveLinkModal"
    />
  </suspense>

  <suspense>
    <edit-modal
      :show="showEdit"
      :store="store"
      :share-type="modelValue"
      @ok="toggleEditModal"
    />
  </suspense>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, ref, PropType } from 'vue';

// Components
import BaseSelect, { Search } from '@/components/BaseSelect.vue';

// Stores
import { GlobalStore } from '../stores/global';

/**
 * A component that allows users to select a Share Type linked to the currently
 * selected instance.  A custom instanceStore may be passed in if using the global
 * instanceStore is not desired.
 */
export default defineComponent({
  components: {
    BaseSelect,
    AddLinkModal: defineAsyncComponent(() => import(/* webpackChunkName: "st" */ './ShareTypeAddLinkModal.vue')),
    EditModal: defineAsyncComponent(() => import(/* webpackChunkName: "st" */ './ShareTypeEditModal.vue')),
    RemoveUnlinkModal: defineAsyncComponent(() => import(/* webpackChunkName: "st" */ './ShareTypeRemoveUnlinkModal.vue')),
  },
  props: {
    modelValue: {
      type: Object as PropType<ShareType|null>,
      default: undefined,
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
    // True the AddLinkModal is displayed
    const showAddLink = ref(false);

    // True when the RemoveLinkModal is displayed
    const showRemoveLink = ref(false);

    // True when the edit modal is displayed
    const showEdit = ref(false);

    // Returns the name of the share type to the base-select component
    const value: Search = (x) => (typeof x === 'object' ? x?.name ?? x : x);

    /**
     * When an item is selected, update our parent
     */
    function update(item: ShareType) { emit('update:modelValue', item); }

    /**
     * When the user clicks Add..., open the AddLinkModal
     */
    function toggleAddLinkModal() { showAddLink.value = !showAddLink.value; }

    /**
     * When the user clicks Edit..., open the Edit modal.
     */
    function toggleEditModal() {
      if (!props.modelValue) return;
      showEdit.value = !showEdit.value;
    }

    /**
     * When the user clicks Delete..., open the RemoveLinkModal
     */
    function toggleRemoveLinkModal() { showRemoveLink.value = !showRemoveLink.value; }

    return {
      options: props.store.shareType.shareTypes,
      update,
      value,
      showAddLink,
      toggleAddLinkModal,
      showEdit,
      toggleEditModal,
      showRemoveLink,
      toggleRemoveLinkModal,
    };
  },
});
</script>
