<template>
  <Select
    :options="GroupState.groups"
    :key="(x) => x ? x.id : null"
    :value="(x) => x ? x.name : null"
    :default="GroupState.selectedGroup"
    msg="Select a group..."
    @select="handleSelection"
  >
    <template #list="props">
      <li
        v-for="option in props.options"
        :key="option.id"
        :class="props.class"
        @click="props.select(option)"
      >
        {{option.name}}
      </li>
      <li class="select__items__divider"><hr /></li>
      <li :class="props.class" @click.prevent="startAdd">
        Add...
      </li>
      <li :class="props.class" @click.prevent="startEdit">
        Rename...
      </li>
      <li :class="props.class" @click.prevent="startDelete">
        Delete...
      </li>
    </template>
  </Select>
  <Modal
    :title="modalTitle"
    :customClass="modalClass"
    :show="showModal"
    cancelLabel="Cancel"
    @ok.prevent="handleOk"
    @cancel.prevent="handleCancel"
  >
      <template v-if="modalState === ModalState.DELETE">
        This action cannot be undone!
      </template>
      <template v-else>
        <div class="group-form">
          <label for="group-form__group-name">Name</label>
          <input type="text" ref="inputElement" id="group-form__group-name" v-model="input" />
        </div>
      </template>
  </Modal>
</template>

<script lang="ts">
import Select from '@/components/Select.vue';
import GlobalState from '@/store/modules/global';
import InstanceState from '@/store/modules/instance';
import GroupState from '@/store/modules/group';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';
import Modal from '@/components/Modal.vue';

enum ModalState {
  ADD,
  EDIT,
  DELETE,
}

// TODO: Decouple selectedGroup, selection, and GroupState.selectedGroup
export default defineComponent({
  components: {
    Select,
    Modal,
  },
  props: {
    selectedGroup: {
      type: Object as () => Group|null,
      required: false,
      default: null,
    },
  },
  emits: [
    'select',
    'added',
    'updated',
    'deleted',
  ],
  setup(props, { emit }) {
    const modalState = ref<ModalState>(ModalState.ADD);
    const showModal = ref(false);
    const inputElement = ref<HTMLInputElement|null>(null);
    const input = ref('');
    const selection = ref<Group|null>(props.selectedGroup);

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

    // Get groups when the instance changes
    watchEffect(() => {
      if (InstanceState.selectedInstance !== null) {
        GroupState.fetchGroups({
          instanceId: InstanceState.selectedInstance.id,
        });
      }
    });

    // Focus the input element when the modal is shown
    watchEffect(() => {
      if (showModal.value && modalState.value !== ModalState.DELETE) {
        setTimeout(() => {
          if (inputElement.value !== null) {
            inputElement.value.select();
          }
        }, 10);
      }
    });

    // If the group list changes elsewhere, update the selection as the name may have changed.
    watch(() => GroupState.groups, () => {
      if (selection.value === null) return;
      const selectedGroup = GroupState.groups.find((x) => x.id === selection.value?.id ?? -1) ?? null;
      selection.value = selectedGroup;
    });

    // Emit a selection event and set the selected item
    function handleSelection(item: Group) {
      selection.value = item;
      emit('select', item);
    }

    // Toggle the modal
    function toggle() {
      showModal.value = !showModal.value;
    }

    // Set the modal state to 'ADD' and show it
    function startAdd() {
      input.value = '';
      modalState.value = ModalState.ADD;
      toggle();
    }

    // Set the modal state to 'EDIT' and show it
    function startEdit() {
      if (selection.value !== null) {
        input.value = selection.value.name;
        modalState.value = ModalState.EDIT;
        toggle();
      }
    }

    // Set the modal state to 'DELETE' and show it
    function startDelete() {
      if (selection.value !== null) {
        modalState.value = ModalState.DELETE;
        toggle();
      }
    }

    // Reset input and close the modal
    function handleCancel() {
      input.value = '';
      toggle();
    }

    // Find a group by its name
    function findByName(name: string): Group|null {
      const group = GroupState.groups.find((x) => x.name === name) ?? null;
      return group;
    }

    // Add, edit, or delete the group
    async function handleOk() {
      if (InstanceState.selectedInstance === null) return;

      if (modalState.value === ModalState.ADD) {
        try {
          await GroupState.newGroup({
            instanceId: InstanceState.selectedInstance.id,
            name: input.value,
          });

          const group = findByName(input.value);
          selection.value = group;
          emit('added', group);
        } catch (e) {
          GlobalState.setCurrentError(e?.message ?? e);
        } finally {
          toggle();
        }
      }

      if (modalState.value === ModalState.EDIT) {
        if (selection.value === null) return;

        try {
          await GroupState.updateGroup({
            id: selection.value.id,
            name: input.value,
          });

          const group = findByName(input.value);
          selection.value = group;
          emit('updated', group);
        } catch (e) {
          GlobalState.setCurrentError(e?.message ?? e);
        } finally {
          toggle();
        }
      }

      if (modalState.value === ModalState.DELETE) {
        if (selection.value === null) return;

        try {
          await GroupState.deleteGroup(selection.value);
          selection.value = null;
          emit('deleted', selection);
        } catch (e) {
          GlobalState.setCurrentError(e?.message ?? e);
        } finally {
          toggle();
        }
      }
    }

    return {
      GroupState,
      ModalState,
      showModal,
      modalState,
      modalTitle,
      modalClass,
      toggle,
      startAdd,
      startEdit,
      startDelete,
      handleOk,
      handleCancel,
      input,
      inputElement,
      handleSelection,
      selection,
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

  .group-form {
    display: flex;
    flex-direction: column;
  }
</style>
