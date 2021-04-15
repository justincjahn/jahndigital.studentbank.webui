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
          @click.prevent="toggleBulkTransaction"
        >
          Bulk Transaction
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
          @click.prevent="toggleBulkGroup"
        >
          Bulk Move
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
          :disabled="selectedGroup === null"
          @click.prevent="toggleNewStudent"
        >
          New Student
        </button>

        <new-student-modal
          :show="showNewStudentModal"
          :group-store="groupStore"
          @ok="toggleNewStudent"
          @cancel="toggleNewStudent"
        />
      </span>

      <span class="sub-menu__bulk-buttons__button">
        <button @click.prevent="toggleBulkImport">Bulk Import</button>
        <bulk-import-modal
          :show="showBulkImportModal"
          @ok="toggleBulkImport"
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
import { useRouter } from 'vue-router';

// Services
import selection from '@/services/StudentSelectionService';

// Utils
import injectStrict from '@/utils/injectStrict';

// Stores
import studentStore from '@/modules/admin/stores/student';
import errorStore from '@/store/error';

// Symbols
import { SHARE_TYPE_STORE_SYMBOL } from '@/modules/admin/symbols';
import { GROUP_STORE_SYMBOL } from '../symbols';

const BulkPostModal = defineAsyncComponent(
  () => import(/* webpackChunkName: "admin-groups" */ '../components/BulkPostModal.vue'),
);

const BulkGroupModal = defineAsyncComponent(
  () => import(/* webpackChunkName: "admin-groups" */ '../components/BulkGroupModal.vue'),
);

const BulkImportModal = defineAsyncComponent(
  () => import(/* webpackChunkName: "admin-groups" */ '../components/BulkImportModal.vue'),
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
  },
  setup() {
    const router = useRouter();
    const groupStore = injectStrict(GROUP_STORE_SYMBOL);
    const shareTypeStore = injectStrict(SHARE_TYPE_STORE_SYMBOL);
    const showBulkTransactionModal = ref(false);
    const showNewStudentModal = ref(false);
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
    function handleGroupSelection(item: Group|null) {
      groupStore.setSelected(item);

      router.replace({
        name: 'Groups',
        params: {
          groupId: item?.id ?? -1,
        },
      });
    }

    /**
     * Toggle the bulk transaction modal.
     */
    function toggleBulkTransaction() { showBulkTransactionModal.value = !showBulkTransactionModal.value; }

    /**
     * Toggle the new student modal.
     */
    function toggleNewStudent() { showNewStudentModal.value = !showNewStudentModal.value; }

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
    function handleBulkGroupModalOk(movedGroup: Group) {
      try {
        console.log(movedGroup, selectedStudents.value);
        studentStore.bulkMove(movedGroup, selectedStudents.value);
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      }

      showBulkGroupModal.value = false;
      handleGroupSelection(movedGroup);
      selection.clear();
    }

    /**
     * Toggle the bulk import modal.
     */
    function toggleBulkImport() { showBulkImportModal.value = !showBulkImportModal.value; }

    return {
      selection,
      hasSelection,
      showBulkTransactionModal,
      toggleBulkTransaction,
      showNewStudentModal,
      toggleNewStudent,
      showBulkGroupModal,
      toggleBulkGroup,
      handleBulkGroupModalOk,
      toggleBulkImport,
      showBulkImportModal,
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
