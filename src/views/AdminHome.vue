<template>
  <div class="sub-menu">
    <InstanceSelector />

    <template v-if="InstanceState.selectedInstance">
      <GroupSelector />
    </template>
    <template v-else>
      <p>Please select an instance...</p>
    </template>

    <template v-if="GroupState.selectedGroup">
      <StudentSearch />
    </template>
  </div>

  <StudentList />
</template>

<script lang="ts">
import StudentList from '@/components/StudentList.vue';
import InstanceSelector from '@/components/InstanceSelector.vue';
import GroupSelector from '@/components/GroupSelector.vue';
import StudentSearch from '@/components/StudentSearch.vue';

import InstanceState from '@/store/modules/instance';
import GroupState from '@/store/modules/group';

export default {
  components: {
    StudentList,
    InstanceSelector,
    GroupSelector,
    StudentSearch,
  },
  setup() {
    return {
      InstanceState,
      GroupState,
    };
  },
};
</script>

<style lang="scss">
  .sub-menu {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin: 1em 0;

    // Override the default behavior of the select box for
    // mobile first full width.
    & .select {
      display: block;
      width: 100%;

      &__selected {
        display: block;
        width: 100%;
      }
    }

    & > * {
      margin-top: 0.5em;
    }

    // Override the student-search div to be full width on
    // small resolutions.
    & .student-search {
      flex-grow: 1;

      width: 100%;
      display: flex;
      flex-direction: column;

      & input {
        flex-grow: 1;
        display: inline-block;
        line-height: 1.4em;
        padding: 0.25em;
      }
    }
  }

  @media only screen and (min-width: 700px) {
    .sub-menu {
      flex-direction: row;
      align-items: flex-end;

      & .select {
        display: inherit;
        width: auto;

        &__selected {
          display: inherit;
          width: auto;
        }
      }

      & > * {
        margin: 0;
        margin-right: 0.5em;
      }

      & *:last-child {
        margin-right: 0;
      }

      & .student-search {
        flex-grow: 1;

        width: auto;
        text-align: right;
        align-items: flex-end;

        & label {
          font-size: 1em;
        }

        & input {
          line-height: 1em;
          width: clamp(200px, 20vw, 30vh);
        }
      }
    }
  }
</style>
