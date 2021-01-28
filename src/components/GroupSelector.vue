<template>
  <base-select
    :options="options"
    :value="value"
    :modelValue="modelValue"
    @update:modelValue="update"
    prompt="Select a group..."
  >
    <template #list="{ options, className, select }">
      <li v-for="option in options" :key="option.id" :class="className" @click="select(option)">
        {{option.name}}
      </li>
      <li class="select__items__divider"><hr /></li>
      <li :class="className" @click.prevent="startAdd">Add...</li>
      <li :class="className" @click.prevent="startEdit">Rename...</li>
      <li :class="className" @click.prevent="startDelete">Delete...</li>
    </template>
  </base-select>
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
          <label :for="`group-form__group-name--${id}`">Name</label>
          <input type="text" ref="inputElement" :id="`group-form__group-name--${id}`" v-model="input" />
        </div>
      </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType, watchEffect } from 'vue';
import uuid4 from '@/utils/uuid4';
import BaseSelect, { Search } from '@/components/BaseSelect.vue';
import Modal from '@/components/Modal.vue';
import GlobalState from '@/store/modules/global';
import instanceStore from '@/store/InstanceStore';
import groupStore from '@/store/GroupStore';

enum ModalState {
  ADD,
  EDIT,
  DELETE,
}

export default defineComponent({
  components: {
    BaseSelect,
    Modal,
  },
  props: {
    modelValue: {
      type: Object as PropType<Group|null>,
    },
  },
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
        if (!instanceStore.selected.value) return;

        try {
          const group = await groupStore.newGroup({
            instanceId: instanceStore.selected.value.id,
            name: input.value,
          });

          update(group);
          toggle();
        } catch (e) {
          GlobalState.setCurrentError(e?.message ?? e);
        }
      }

      if (modalState.value === ModalState.EDIT) {
        if (!props.modelValue) return;

        try {
          const group = await groupStore.updateGroup({
            id: props.modelValue.id,
            name: input.value,
          });

          update(group);
          toggle();
        } catch (e) {
          GlobalState.setCurrentError(e?.message ?? e);
        }
      }

      if (modalState.value === ModalState.DELETE) {
        if (!props.modelValue) return;

        try {
          await groupStore.deleteGroup(props.modelValue);
          update(null);
        } catch (e) {
          GlobalState.setCurrentError(e?.message ?? e);
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

    // Clear the group selection when the groups change and our selected group is no longer listed
    watchEffect(() => {
      const selected = groupStore.groups.value?.find((x) => x.id === props.modelValue?.id ?? -1);
      if (!selected) update(null);
    });

    return {
      ModalState,
      options: groupStore.groups,
      value,
      update,
      input,
      showModal,
      modalState,
      modalTitle,
      modalClass,
      startAdd,
      startEdit,
      startDelete,
      handleOk,
      handleCancel,
      id,
    };
  },
});
</script>
