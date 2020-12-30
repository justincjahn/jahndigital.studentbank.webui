<template>
  <div class="sub-menu">
    <template v-if="InstanceState.selectedInstance">
      <group-selector />
    </template>
    <template v-else>
      <p>Please select an instance...</p>
    </template>

    <div class="sub-menu__filter">
      <form @submit.prevent>
        <input type="text"
          aria-label="Filter Students"
          placeholder="Filter..." />

        <input class="sub-menu__filter__reset" type="reset" value="X" />
      </form>
    </div>

    <div class="sub-menu__bulk-buttons">
      <button :disabled="!hasSelection" @click.prevent="selection.clear">Clear Selection</button>
      <button :disabled="!hasSelection" @click.prevent="handleShowBulkTransactionModal()">Bulk Transaction</button>
      <bulk-post-modal
        :show="showBulkTransactionModal"
        @ok="handleBulkTransactionModalOk()"
        @cancel="handleBulkTransactionModalCancel()"
      />
    </div>
  </div>

  <StudentList />
</template>

<script lang="ts">
import StudentList from '@/components/admin/groups/TheStudentList.vue';
import GroupSelector from '@/components/admin/groups/TheGroupSelector.vue';
import BulkPostModal from '@/components/admin/groups/BulkPostModal.vue';
import InstanceState from '@/store/modules/instance';
import GroupState from '@/store/modules/group';
import selection from '@/services/StudentSelectionService';
import { ref, computed } from 'vue';

export default {
  components: {
    StudentList,
    GroupSelector,
    BulkPostModal,
  },
  setup() {
    const showBulkTransactionModal = ref(false);

    const hasSelection = computed(() => {
      if (selection.getGroups().length > 0) return true;
      if (selection.getStudents().length > 0) return true;
      return false;
    });

    function handleShowBulkTransactionModal() {
      showBulkTransactionModal.value = true;
    }

    function handleBulkTransactionModalOk() {
      showBulkTransactionModal.value = false;
    }

    function handleBulkTransactionModalCancel() {
      showBulkTransactionModal.value = false;
    }

    return {
      InstanceState,
      GroupState,
      selection,
      hasSelection,
      showBulkTransactionModal,
      handleShowBulkTransactionModal,
      handleBulkTransactionModalOk,
      handleBulkTransactionModalCancel,
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
