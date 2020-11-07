<template>
  <div class="sub-menu">
    <template v-if="InstanceState.selectedInstance">
      <GroupSelector />
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
      <button @click.prevent="resolve">Resolve</button>
      <button @click.prevent="selection.clear">Clear Selection</button>
    </div>
  </div>

  <StudentList />
</template>

<script lang="ts">
import StudentList from '@/components/StudentList.vue';
import GroupSelector from '@/components/GroupSelector.vue';

import InstanceState from '@/store/modules/instance';
import GroupState from '@/store/modules/group';

import selection from '@/services/StudentSelectionService';

export default {
  components: {
    StudentList,
    GroupSelector,
  },
  setup() {
    /**
     * Resolve the selection into a list of students.
     */
    async function resolve() {
      try {
        const data = await selection.resolve();
        console.log(data);
      } catch (error) {
        // eslint-disable-next-line no-alert
        alert(error?.message ?? error);
      }
    }

    return {
      InstanceState,
      GroupState,
      resolve,
      selection,
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
        color: rgba(0,0,0,0.4);
        position: absolute;
        width: 25px;
        right: 0px;
        outline: none;
        border: none;
        background-color: transparent;
        cursor: pointer;
        height: 100%;
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
