<template>
  <div class="sub-menu">
    <template v-if="selectedInstance">
      <suspense>
        <group-selector
          v-model="selectedGroup"
          :group-store="groupStore"
        />
      </suspense>
    </template>
    <template v-else>
      <p>Please select an instance...</p>
    </template>

    <!--<div class="sub-menu__filter">
      <form @submit.prevent>
        <input type="text"
          aria-label="Filter Students"
          placeholder="Filter..." />

        <input class="sub-menu__filter__reset" type="reset" value="X" />
      </form>
    </div>-->

    <div class="sub-menu__bulk-buttons">
      <button
        :disabled="!hasSelection"
        @click.prevent="selection.clear"
      >
        Clear Selection
      </button>

      <span class="sub-menu__bulk-buttons__button">
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
          :group-store="groupStore"
          @ok="handleBulkGroupModalOk"
          @cancel="toggleBulkGroup"
        />
      </span>

      <span class="sub-menu__bulk-buttons__button">
        <button
          :disabled="!hasSelection"
          @click.prevent="toggleBulkTransaction"
        >
          New Transaction
        </button>

        <bulk-post-modal
          :show="showBulkTransactionModal"
          :group-store="groupStore"
          :share-type-store="shareTypeStore"
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
          :share-type-store="shareTypeStore"
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
          :group-store="groupStore"
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
    <StudentList
      :group-store="groupStore"
      :student-store="studentStore"
    />
  </suspense>
</template>

<script lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue';

// Services
import selection from '@/services/StudentSelectionService';

// Utils
import injectStrict from '@/utils/injectStrict';

// Stores
import { setup as defineStudentStore } from '@/modules/admin/stores/student';
import errorStore from '@/stores/error';

// Symbols
import { SHARE_TYPE_STORE_SYMBOL } from '@/modules/admin/symbols';
import { GROUP_STORE_SYMBOL } from '../symbols';
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

export default {
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
    const groupStore = injectStrict(GROUP_STORE_SYMBOL);
    const studentStore = defineStudentStore();
    const shareTypeStore = injectStrict(SHARE_TYPE_STORE_SYMBOL);
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
          errorStore.setCurrentError(e?.message ?? e);
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
        errorStore.setCurrentError(e?.message ?? e);
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
      instanceStore.setSelected(bulkImportStore.instance.value);

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
      groupStore,
      selectedGroup,
      studentStore,
      shareTypeStore,
      selectedStudents,
      selectedStudentsResolving,
    };
  },
};
</script>

<style lang="scss">
  .sub-menu {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1em;
    padding: 1em;
    background-color: colorStep(secondary);
    margin-bottom: 1em;

    &__filter {
      position: relative;
      flex-basis: clamp(200px, 60vw, 350px);

      & input[type=text] {
        width: 100%;
      }

      &__reset {
        @include input-reset;
      }
    }

    &__bulk-buttons {
      flex-basis: 100%;
    }
  }

  .student-list {
    padding: 0 1.5em;
  }
</style>
