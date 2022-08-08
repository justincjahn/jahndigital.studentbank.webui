<template>
  <div class="sub-menu">
    <template v-if="selectedInstance">
      <suspense>
        <group-selector
          v-model="selectedGroup"
          :store="globalStore"
        />
      </suspense>
    </template>
    <template v-else>
      <p>Please select an instance...</p>
    </template>

    <div class="sub-menu__bulk-buttons">
      <span class="sub-menu__bulk-buttons__button">
        <button
          :disabled="!hasSelection"
          @click.prevent="selection.clear"
        >
          Clear Selection
        </button>
      </span>

      <div class="sub-menu__bulk-buttons__button">
        <button
          :disabled="!hasSelection"
          @click.prevent="toggleBulkGroup"
        >
          Move Selected
        </button>

        <bulk-group-modal
          :show="showBulkGroupModal"
          :students="selectedStudents"
          :loading="selectedStudentsResolving"
          :store="globalStore"
          @ok="handleBulkGroupModalOk"
          @cancel="toggleBulkGroup"
        />
      </div>

      <span class="sub-menu__bulk-buttons__button">
        <button
          :disabled="!hasSelection"
          @click.prevent="toggleBulkTransaction"
        >
          New Transaction
        </button>

        <bulk-post-modal
          :show="showBulkTransactionModal"
          :store="globalStore"
          @ok="toggleBulkTransaction"
          @cancel="toggleBulkTransaction"
        />
      </span>

      <span class="sub-menu__bulk-buttons__button">
        <button
          :disabled="!hasSelection"
          @click.prevent="toggleNewShare"
        >
          New Share
        </button>

        <new-share-modal
          :show="showNewShareModal"
          :store="globalStore"
          @ok="handleNewShareModalOk"
        />
      </span>

      <span class="sub-menu__bulk-buttons__button">
        <button
          :disabled="selectedGroup === null"
          @click.prevent="toggleNewStudent"
        >
          New Student
        </button>

        <new-student-modal
          :show="showNewStudentModal"
          :store="globalStore"
          @ok="handleNewStudentModalOk"
          @cancel="toggleNewStudent"
        />
      </span>

      <span class="sub-menu__bulk-buttons__button">
        <button
          @click.prevent="toggleBulkImport"
        >
          Bulk Import
        </button>

        <bulk-import-modal
          :show="showBulkImportModal"
          @ok="handleBulkImportModalOk"
          @cancel="toggleBulkImport"
        />
      </span>
    </div>
  </div>

  <suspense>
    <student-list :store="globalStore" />
  </suspense>
</template>

<script lang="ts">
import { ref, computed, defineAsyncComponent, defineComponent } from 'vue';

// Services
import selection from '@/services/StudentSelectionService';

// Utils
import injectStrict from '@/utils/injectStrict';

// Symbols
import { GLOBAL_STORE } from '@/modules/admin/symbols';
import { BulkImportStore } from '../stores/bulkImport';

const BulkPostModal = defineAsyncComponent(
  () => import(/* webpackChunkName: "admin-groups" */ '../components/BulkPostModal.vue'),
);

const BulkGroupModal = defineAsyncComponent(
  () => import(/* webpackChunkName: "admin-groups" */ '../components/BulkGroupModal.vue'),
);

const BulkImportModal = defineAsyncComponent(
  () => import(/* webpackChunkName: "admin-groups" */ '../components/BulkImportModal.vue'),
);

const NewShareModal = defineAsyncComponent(
  () => import(/* webpackChunkName: "admin-groups" */ '../components/NewShareModal.vue'),
);

const NewStudentModal = defineAsyncComponent(
  () => import(/* webpackChunkName: "admin-groups" */ '../components/NewStudentModal.vue'),
);

const GroupSelector = defineAsyncComponent(
  () => import(/* webpackChunkName: "admin-groups" */ '@/modules/admin/components/GroupSelector.vue'),
);

const StudentList = defineAsyncComponent(
  () => import(/* webpackChunkName: "admin-groups" */ '../components/StudentList.vue'),
);

export default defineComponent({
  components: {
    StudentList,
    GroupSelector,
    BulkPostModal,
    NewStudentModal,
    BulkGroupModal,
    BulkImportModal,
    NewShareModal,
  },
  setup() {
    const globalStore = injectStrict(GLOBAL_STORE);
    const errorStore = globalStore.error;
    const groupStore = globalStore.group;
    const studentStore = globalStore.student;
    const shareTypeStore = globalStore.shareType;
    const showBulkTransactionModal = ref(false);
    const showNewStudentModal = ref(false);
    const showNewShareModal = ref(false);
    const showBulkGroupModal = ref(false);
    const showBulkImportModal = ref(false);
    const hasSelection = computed(() => selection.length > 0);

    // True if the selected students are being resolved.
    const selectedStudentsResolving = ref(false);

    // A list of selected students, resolved when the user opens certain modals
    const selectedStudents = ref<Student[]>([]);

    // GETs/SETs The currently selected group
    const selectedGroup = computed<Group|null>({
      get: () => groupStore.selected.value,
      set: (value) => groupStore.setSelected(value),
    });

    /**
     * Set the selected group and update the route when the user selects a group.
     */
    function handleGroupSelection(item: Group|null) { groupStore.setSelected(item); }

    /**
     * Toggle the bulk transaction modal.
     */
    function toggleBulkTransaction() { showBulkTransactionModal.value = !showBulkTransactionModal.value; }

    /**
     * Toggle the new share type modal.
     */
    function toggleNewShare() { showNewShareModal.value = !showNewShareModal.value; }

    /**
     * Close the new share modal when the user presses Ok.
     */
    function handleNewShareModalOk() { toggleNewShare(); }

    /**
     * Toggle the new student modal.
     */
    function toggleNewStudent() { showNewStudentModal.value = !showNewStudentModal.value; }

    /**
     * When the user presses OK on the new student modal, refresh the stores.
     */
    async function handleNewStudentModalOk(student: Student) {
      await studentStore.fetch({ groupId: student.groupId, cache: false });
      toggleNewStudent();
    }

    /**
     * Toggle the bulk group move modal and resolve the list of students.
     */
    async function toggleBulkGroup() {
      if (showBulkGroupModal.value === false) {
        try {
          selectedStudentsResolving.value = true;
          showBulkGroupModal.value = true;
          selectedStudents.value = await selection.resolve();
        } catch (e) {
          if (e instanceof Error) {
            errorStore.setCurrentError(e?.message ?? e);
          }
        } finally {
          selectedStudentsResolving.value = false;
        }
      } else {
        showBulkGroupModal.value = false;
      }
    }

    /**
     * When the user presses OK on the bulk group modal, call the API to do the move.
     */
    async function handleBulkGroupModalOk(movedGroup: Group) {
      selectedStudentsResolving.value = true;

      try {
        await studentStore.bulkMove(movedGroup, selectedStudents.value);
        showBulkGroupModal.value = false;
        handleGroupSelection(movedGroup);
        selection.clear();
      } catch (e) {
        if (e instanceof Error) {
          errorStore.setCurrentError(e?.message ?? e);
        }
      } finally {
        selectedStudentsResolving.value = false;
      }
    }

    /**
     * Toggle the bulk import modal.
     */
    function toggleBulkImport() { showBulkImportModal.value = !showBulkImportModal.value; }

    /**
     * Reset the stores and close the modal.
     */
    async function handleBulkImportModalOk(bulkImportStore: BulkImportStore) {
      const { instanceStore } = groupStore;

      // Force an instance refresh and set the selected instance
      await instanceStore.fetchInstances(false);
      instanceStore.selected.value = bulkImportStore.instance.value;

      // Force a group refresh and select the first group
      await groupStore.fetchGroups(instanceStore.selected.value?.id ?? -1, false);
      const firstGroup = groupStore.groups.value[0];
      if (firstGroup) groupStore.setSelected(firstGroup);

      // Close the modal
      toggleBulkImport();
    }

    return {
      selection,
      hasSelection,
      showBulkTransactionModal,
      toggleBulkTransaction,
      showNewStudentModal,
      toggleNewStudent,
      handleNewStudentModalOk,
      showBulkGroupModal,
      toggleBulkGroup,
      handleBulkGroupModalOk,
      toggleBulkImport,
      handleBulkImportModalOk,
      showBulkImportModal,
      showNewShareModal,
      toggleNewShare,
      handleNewShareModalOk,
      selectedInstance: groupStore.instanceStore.selected,
      shareTypeStore,
      groupStore,
      selectedGroup,
      studentStore,
      globalStore,
      selectedStudents,
      selectedStudentsResolving,
    };
  },
});
</script>

<style lang="scss">
  .sub-menu {
    padding: 1em;
    margin-bottom: 1em;
    background-color: colorStep(secondary);

    .group-selector {
      width: 100%;
      margin-bottom: 1em;

      button {
        width: 100%;
      }

      ul {
        width: calc(100% - 2.15em);
      }

      @media screen and (min-width: 700px) {
        width: 12rem;

        button {
          width: 12rem;
        }

        ul {
          width: 12rem;
        }
      }
    }

    &__bulk-buttons {
      display: flex;
      flex-direction: column;

      button {
        width: 100%;
      }

      @media screen and (min-width: 700px) {
        flex-direction: row;

        button {
          width: inherit;
        }
      }
    }
  }

  .student-list {
    padding: 0 1.5em;
  }
</style>
