<template>
  <Select
    :options="InstanceState.instances"
    :key="(x) => x ? x.id : null"
    :value="(x) => x ? x.description : null"
    :default="InstanceState.selectedInstance"
    @select="selectInstance"
  >
    <template v-slot:selected="option">
      <template v-if="option.isActive"><span class="active">(Active)</span> {{option.description}}</template>
      <template v-else>{{option.description}}</template>
    </template>
    <template v-slot:list="props">
      <li
        v-for="option in props.options"
        :key="option.id"
        :class="props.class"
        @click="props.select(option)"
      >
        <template v-if="option.isActive"><span class="active">(Active)</span> {{option.description}}</template>
        <template v-else>{{option.description}}</template>
      </li>
      <li class="select__items__divider"><hr /></li>
      <li :class="props.class" @click.prevent="startNew">
        Add...
      </li>
      <li :class="props.class" @click.prevent="startRename">
        Rename...
      </li>
      <li :class="props.class" @click.prevent="toggleConfirmDelete">
        Delete...
      </li>
    </template>
  </Select>

  <InstanceForm
    :show="isNewInstanceOpen"
    :description="
      isRename ? (
        InstanceState.selectedInstance
        && InstanceState.selectedInstance.description
        || 'Error!'
      ) : undefined"
    :title="isRename ? 'Edit Instance' : undefined"
    @ok.self="handleInstanceInput"
    @cancel="toggleInstanceForm" />

  <Modal
    :show="isModalOpen"
    title="Are you sure?"
    customClass="destructive"
    okLabel="Delete"
    cancelLabel="Cancel"
    @ok="deleteInstance"
    @cancel="toggleConfirmDelete"
  >
    This cannot be undone!
  </Modal>
</template>

<script lang="ts">
import Instance from '@/@types/Instance';
import Select from '@/components/Select.vue';
import Modal from '@/components/Modal.vue';
import InstanceForm from '@/components/InstanceForm.vue';
import GlobalState from '@/store/modules/global';
import InstanceState from '@/store/modules/instance';
import GroupState from '@/store/modules/group';
import { defineComponent, ref, watchEffect } from 'vue';

export default defineComponent({
  components: {
    Select,
    Modal,
    InstanceForm,
  },
  setup() {
    // If the modal is open.
    const isModalOpen = ref(false);

    // If the new instance modal is open
    const isNewInstanceOpen = ref(false);

    // If the current operation is a rename
    const isRename = ref(false);

    // Fetch instances if they haven't been fetched yet
    if (InstanceState.instances.length === 0) {
      InstanceState.fetchInstances();
    }

    // If there is no selected instance, try to select the active one.
    watchEffect(() => {
      if (InstanceState.instances.length > 0 && InstanceState.selectedInstance === null) {
        const selected = InstanceState.instances.find((x) => x.isActive);
        if (selected) InstanceState.setSelectedInstance(selected);
      }
    });

    /**
     * Open or close the New Instance form.
     */
    function toggleInstanceForm() {
      isNewInstanceOpen.value = !isNewInstanceOpen.value;
    }

    /**
     * Open the delete confirmation dialog when the user wishes to delete an instance.
     */
    function toggleConfirmDelete() {
      if (InstanceState.selectedInstance) {
        isModalOpen.value = !isModalOpen.value;
      }
    }

    /**
     * Begin the rename process and open the modal.
     */
    function startRename() {
      isRename.value = true;
      toggleInstanceForm();
    }

    /**
     * Begin the new instance process and open the modal.
     */
    function startNew() {
      isRename.value = false;
      toggleInstanceForm();
    }

    /**
     * Set the provided instance as selected.
     *
     * @param item The instance object to select.
     */
    function selectInstance(item: Instance) {
      if (item.id === -1) {
        startNew();
        return;
      }

      if (item.id === -2) {
        startRename();
        return;
      }

      if (item.id === -3) {
        toggleConfirmDelete();
        return;
      }

      if (InstanceState.selectedInstance) {
        if (InstanceState.selectedInstance.id !== item.id) {
          GroupState.setSelectedGroup(null);
        }
      }

      InstanceState.setSelectedInstance(item);
    }

    /**
     * Update the selected instance with the provided description.
     */
    async function updateInstance(description: string) {
      if (description.length < 3) {
        GlobalState.setCurrentError('Instance must have a description!');
        return;
      }

      if (InstanceState.selectedInstance === null) return;

      try {
        await InstanceState.updateInstance({
          id: InstanceState.selectedInstance.id,
          description,
        });

        isNewInstanceOpen.value = false;
      } catch (e) {
        GlobalState.setCurrentError(e?.message ?? e);
      }
    }

    /**
     * Create a new instance with the provided description.
     */
    async function newInstance(description: string) {
      if (description.length < 3) {
        GlobalState.setCurrentError('Instance must have a description!');
        return;
      }

      try {
        await InstanceState.newInstance({ description });
        isNewInstanceOpen.value = false;
      } catch (e) {
        GlobalState.setCurrentError(e?.message ?? e);
      }
    }

    /**
     * Delete the selected instance.
     */
    async function deleteInstance() {
      if (InstanceState.selectedInstance) {
        try {
          await InstanceState.deleteInstance(InstanceState.selectedInstance);
        } catch (e) {
          GlobalState.setCurrentError(e.message ?? e);
        } finally {
          isModalOpen.value = false;
        }
      }
    }

    /**
     * Fired once the user clicks the OK button on the modal.  Create a new instance or
     * update the selected instance.
     */
    async function handleInstanceInput(description: string) {
      if (isRename.value === true) {
        await updateInstance(description);
        return;
      }

      await newInstance(description);
    }

    return {
      InstanceState,
      isModalOpen,
      isNewInstanceOpen,
      isRename,
      selectInstance,
      toggleInstanceForm,
      toggleConfirmDelete,
      deleteInstance,
      handleInstanceInput,
      startNew,
      startRename,
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

  span.active {
    font-size: 0.7em;
  }
</style>
