<template>
  <base-select
    prompt="Select a group..."
    class="group-selector"
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
      <li :class="className" @click.prevent="startAdd">
        Add...
      </li>
      <li :class="className" @click.prevent="startEdit">
        Rename...
      </li>
      <li :class="className" @click.prevent="startDelete">
        Delete...
      </li>
    </template>
  </base-select>

  <modal
    cancel-label="Cancel"
    :title="modalTitle"
    :class="modalClass"
    :show="showModal"
    @ok.prevent="handleOk"
    @cancel.prevent="handleCancel"
  >
    <template v-if="modalState === ModalState.DELETE">
      This action cannot be undone!
    </template>
    <template v-else>
      <div class="group-form">
        <label :for="`group-form__group-name--${id}`">Name</label>
        <input
          :id="`group-form__group-name--${id}`"
          ref="inputElement"
          v-model="input"
          type="text"
        />
      </div>
    </template>
  </modal>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue';

// Components
import BaseSelect, { Search } from '@/components/BaseSelect.vue';
import Modal from '@/components/Modal.vue';

// Utils
import uuid4 from '@/utils/uuid4';

// Stores
import errorStore from '@/stores/error';
import { GroupStore } from '../groups/stores/group';

enum ModalState {
  ADD,
  EDIT,
  DELETE,
}

/**
 * A component that allows users to select, add, rename, and delete a Group linked to the currently
 * selected instance. A custom groupStore may be passed in if using the global groupStore is not
 * desired.
 */
export default defineComponent({
  components: {
    BaseSelect,
    Modal,
  },
  props: {
    modelValue: {
      type: Object as PropType<Group|null>,
      default: undefined,
    },
    groupStore: {
      type: Object as PropType<GroupStore>,
      required: true,
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup(props, { emit }) {
    const modalState = ref<ModalState>(ModalState.ADD);

    const showModal = ref(false);

    const input = ref('');

    const id = uuid4();

    // The title of the modal window
    const modalTitle = computed(() => {
      if (modalState.value === ModalState.ADD) {
        return 'Create a Group';
      }

      if (modalState.value === ModalState.EDIT) {
        return 'Rename Group';
      }

      return 'Are you sure?';
    });

    // The class of the modal window
    const modalClass = computed(() => {
      if (modalState.value === ModalState.DELETE) {
        return 'destructive';
      }

      return null;
    });

    // Return the name of the group as the value
    const value: Search = (x) => (typeof x === 'object' ? x?.name ?? x : x);

    // Cascade the model update
    function update(item: Group|null) { emit('update:modelValue', item); }

    // Toggle the modal
    function toggle() { showModal.value = !showModal.value; }

    // Set the modal state to 'ADD' and show it
    function startAdd() {
      input.value = '';
      modalState.value = ModalState.ADD;
      toggle();
    }

    // Set the modal state to 'EDIT' and show it
    function startEdit() {
      if (!props.modelValue) return;
      input.value = props.modelValue.name;
      modalState.value = ModalState.EDIT;
      toggle();
    }

    // Set the modal state to 'DELETE' and show it
    function startDelete() {
      if (!props.modelValue) return;
      modalState.value = ModalState.DELETE;
      toggle();
    }

    // Add a group or update and delete the selected group.
    async function handleOk() {
      if (modalState.value === ModalState.ADD) {
        if (!props.groupStore.instanceStore.selected.value) return;

        try {
          const group = await props.groupStore.newGroup({
            instanceId: props.groupStore.instanceStore.selected.value.id,
            name: input.value,
          });

          update(group);
          toggle();
        } catch (e) {
          errorStore.setCurrentError(e?.message ?? e);
        }
      }

      if (modalState.value === ModalState.EDIT) {
        if (!props.modelValue) return;

        try {
          const group = await props.groupStore.updateGroup({
            id: props.modelValue.id,
            name: input.value,
          });

          update(group);
          toggle();
        } catch (e) {
          errorStore.setCurrentError(e?.message ?? e);
        }
      }

      if (modalState.value === ModalState.DELETE) {
        if (!props.modelValue) return;

        try {
          await props.groupStore.deleteGroup(props.modelValue);
          update(null);
        } catch (e) {
          errorStore.setCurrentError(e?.message ?? e);
        } finally {
          toggle();
        }
      }
    }

    // Reset input and close the modal
    function handleCancel() {
      input.value = '';
      toggle();
    }

    return {
      ModalState,
      options: props.groupStore.groups,
      modalTitle,
      modalClass,
      modalState,
      showModal,
      startAdd,
      startEdit,
      startDelete,
      handleOk,
      handleCancel,
      input,
      update,
      value,
      id,
    };
  },
});
</script>

<style lang="scss" scoped>
  .group-form {
    display: flex;
    flex-direction: column;
    gap: 1em;
  }
</style>
