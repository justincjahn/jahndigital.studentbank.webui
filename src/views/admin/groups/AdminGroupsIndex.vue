<template>
  <div class="sub-menu">
    <template v-if="InstanceState.selectedInstance">
      <group-selector @select="handleGroupSelection" :selectedGroup="GroupState.selectedGroup" />
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
      <button :disabled="!hasSelection" @click.prevent="selection.clear">Clear Selection</button>

      <Suspense>
        <template #default>
          <span class="sub-menu__bulk-buttons__button">
            <button :disabled="!hasSelection" @click.prevent="handleShowBulkTransactionModal()">Bulk Transaction</button>
            <bulk-post-modal
              :show="showBulkTransactionModal"
              @ok="handleBulkTransactionModalOk"
              @cancel="handleBulkTransactionModalCancel"
            />
          </span>
        </template>
        <template #fallback><loading-icon /></template>
      </Suspense>

      <Suspense>
        <template #default>
          <span class="sub-menu__bulk-buttons__button">
            <button :disabled="!hasSelection" @click.prevent="handleShowBulkGroupModal()">Bulk Move</button>
            <bulk-group-modal
              :show="showBulkGroupModal"
              @ok="handleBulkGroupModalOk"
              @cancel="handleBulkGroupModalCancel"
            />
          </span>
        </template>
        <template #fallback><loading-icon /></template>
      </Suspense>
    </div>
  </div>

  <StudentList />
</template>

<script lang="ts">
import StudentList from '@/components/admin/groups/TheStudentList.vue';
import GroupSelector from '@/components/GroupSelector.vue';
import InstanceState from '@/store/modules/instance';
import GroupState from '@/store/modules/group';
import selection from '@/services/StudentSelectionService';
import { ref, computed, watchEffect, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LoadingIcon from '@/components/LoadingIcon.vue';

const BulkPostModal = defineAsyncComponent(
  () => import('@/components/admin/groups/BulkPostModal.vue'),
);

const BulkGroupModal = defineAsyncComponent(
  () => import('@/components/admin/groups/BulkGroupModal.vue'),
);

export default {
  components: {
    StudentList,
    GroupSelector,
    BulkPostModal,
    LoadingIcon,
    BulkGroupModal,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const showBulkTransactionModal = ref(false);
    const showBulkGroupModal = ref(false);

    const hasSelection = computed(() => {
      if (selection.getGroups().length > 0) return true;
      if (selection.getStudents().length > 0) return true;
      return false;
    });

    // Rehydrate the selected group
    watchEffect(() => {
      if (
        GroupState.groups.length > 0
        && GroupState.selectedGroup === null
        && route.params.groupId
      ) {
        const gid = parseInt(route.params.groupId as string, 10) ?? -1;
        const group = GroupState.groups.find((x) => x.id === gid);

        if (group && (InstanceState.selectedInstance?.id === group.id ?? false)) {
          GroupState.setSelectedGroup(group);
        }
      }
    });

    function handleGroupSelection(item: Group|null) {
      GroupState.setSelectedGroup(item);

      router.replace({
        name: 'Groups',
        params: {
          groupId: item?.id ?? -1,
        },
      });
    }

    function handleShowBulkTransactionModal() {
      showBulkTransactionModal.value = true;
    }

    function handleBulkTransactionModalOk() {
      showBulkTransactionModal.value = false;
    }

    function handleBulkTransactionModalCancel() {
      showBulkTransactionModal.value = false;
    }

    function handleShowBulkGroupModal() {
      showBulkGroupModal.value = true;
    }

    function handleBulkGroupModalOk(movedGroup: Group) {
      showBulkGroupModal.value = false;
      const group = GroupState.groups.find((x) => x.id === movedGroup.id) ?? null;
      handleGroupSelection(group);
      selection.clear();
    }

    function handleBulkGroupModalCancel() {
      showBulkGroupModal.value = false;
    }

    return {
      InstanceState,
      GroupState,
      selection,
      hasSelection,
      handleGroupSelection,
      showBulkTransactionModal,
      handleShowBulkTransactionModal,
      handleBulkTransactionModalOk,
      handleBulkTransactionModalCancel,
      showBulkGroupModal,
      handleShowBulkGroupModal,
      handleBulkGroupModalOk,
      handleBulkGroupModalCancel,
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
