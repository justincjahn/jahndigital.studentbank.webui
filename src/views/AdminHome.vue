<template>
  <div class="side-panel">
    <Select
      :options="InstanceState.instances"
      :key="(x) => x ? x.id : null"
      :value="(x) => x ? x.description : null"
      :default="InstanceState.selectedInstance"
      @select="selectInstance"
    />

    <button @click.prevent="startRename">~</button>
    <button @click.prevent="startNew">+</button>
    <button @click.prevent="toggleConfirmDelete">&minus;</button>

    <div v-if="InstanceState.selectedInstance">
      <GroupList />
    </div>
    <div v-else>
      <p>Please select an instance...</p>
    </div>
  </div>
  <div class="main-panel">
    <StudentList />
  </div>
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
  <InstanceForm
    :show="isNewInstanceOpen"
    :description="isRename ? (InstanceState.selectedInstance?.description ?? '') : undefined"
    :title="isRename ? 'Edit Instance' : undefined"
    @ok.self="handleInstanceInput"
    @cancel="toggleInstanceForm" />
</template>

<script lang="ts">
import Instance from '@/@types/Instance';
import GlobalState from '@/store/modules/global';
import InstanceState from '@/store/modules/instance';
import GroupState from '@/store/modules/group';
import StudentState from '@/store/modules/student';
import Select from '@/components/Select.vue';
import GroupList from '@/components/GroupList.vue';
import StudentList from '@/components/StudentList.vue';
import Modal from '@/components/Modal.vue';
import InstanceForm from '@/components/InstanceForm.vue';
import { ref, watchEffect } from 'vue';

export default {
  components: {
    Select,
    GroupList,
    StudentList,
    Modal,
    InstanceForm,
  },
  setup() {
    const isModalOpen = ref(false);
    const isNewInstanceOpen = ref(false);
    const isRename = ref(false);

    if (InstanceState.instances.length === 0) {
      InstanceState.fetchInstances();
    }

    watchEffect(() => {
      if (InstanceState.instances.length > 0 && InstanceState.selectedInstance === null) {
        const selected = InstanceState.instances.find((x) => x.isActive);
        if (selected) InstanceState.setSelectedInstance(selected);
      }
    });

    function selectInstance(item: Instance) {
      if (InstanceState.selectedInstance) {
        if (InstanceState.selectedInstance.id !== item.id) {
          GroupState.setSelectedGroup(null);
        }
      }

      InstanceState.setSelectedInstance(item);
    }

    function toggleInstanceForm() {
      isNewInstanceOpen.value = !isNewInstanceOpen.value;
    }

    function startRename() {
      isRename.value = true;
      toggleInstanceForm();
    }

    function startNew() {
      isRename.value = false;
      toggleInstanceForm();
    }

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

    async function handleInstanceInput(description: string) {
      console.log(isRename.value);

      if (isRename.value === true) {
        await updateInstance(description);
        return;
      }

      await newInstance(description);
    }

    function toggleConfirmDelete() {
      if (InstanceState.selectedInstance) {
        isModalOpen.value = !isModalOpen.value;
      }
    }

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

    return {
      InstanceState,
      StudentState,
      GroupState,
      selectInstance,
      isRename,
      isModalOpen,
      isNewInstanceOpen,
      toggleConfirmDelete,
      startRename,
      startNew,
      toggleInstanceForm,
      handleInstanceInput,
      deleteInstance,
    };
  },
};
</script>
