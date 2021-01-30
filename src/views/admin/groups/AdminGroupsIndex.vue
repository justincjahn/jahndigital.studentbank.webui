<template>
  <div class="sub-menu">
    <template v-if="selectedInstance">
      <the-group-selector />
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
            <button :disabled="!hasSelection" @click.prevent="toggleBulkTransaction()">Bulk Transaction</button>
            <bulk-post-modal
              :show="showBulkTransactionModal"
              @ok="toggleBulkTransaction"
              @cancel="toggleBulkTransaction"
            />
          </span>
        </template>
        <template #fallback><loading-icon /></template>
      </Suspense>

      <Suspense>
        <template #default>
          <span class="sub-menu__bulk-buttons__button">
            <button :disabled="!hasSelection" @click.prevent="toggleBulkGroup()">Bulk Move</button>
            <bulk-group-modal
              :show="showBulkGroupModal"
              @ok="handleBulkGroupModalOk"
              @cancel="toggleBulkGroup"
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
import TheGroupSelector from '@/components/admin/groups/TheGroupSelector.vue';
import groupStore from '@/store/group';
import selection from '@/services/StudentSelectionService';
import { ref, computed, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
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
    TheGroupSelector,
    BulkPostModal,
    LoadingIcon,
    BulkGroupModal,
  },
  setup() {
    const router = useRouter();
    const showBulkTransactionModal = ref(false);
    const showBulkGroupModal = ref(false);
    const hasSelection = computed(() => selection.length > 0);

    function handleGroupSelection(item: Group|null) {
      groupStore.setSelected(item);

      router.replace({
        name: 'Groups',
        params: {
          groupId: item?.id ?? -1,
        },
      });
    }

    function toggleBulkTransaction() { showBulkTransactionModal.value = !showBulkTransactionModal.value; }

    function toggleBulkGroup() { showBulkGroupModal.value = !showBulkGroupModal.value; }

    function handleBulkGroupModalOk(movedGroup: Group) {
      showBulkGroupModal.value = false;
      handleGroupSelection(movedGroup);
      selection.clear();
    }

    return {
      selection,
      hasSelection,
      showBulkTransactionModal,
      toggleBulkTransaction,
      showBulkGroupModal,
      toggleBulkGroup,
      handleBulkGroupModalOk,
      selectedInstance: groupStore.instanceStore.selected,
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
