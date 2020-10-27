<template>
  <button @click.prevent="resolve">Resolve</button>
  <button @click.prevent="selection.clear">Clear</button>
  <table class="student-list" :class="{ 'student-list--loading': StudentStore.loading }">
    <thead>
      <tr>
        <th>
          <input
            type="checkbox"
            :checked="selection.hasGroup(GroupStore.selectedGroup)"
            @click="selection.toggleGroup(GroupStore.selectedGroup)"
          />
        </th>
        <th>Account Number</th>
        <th>First Name</th>
        <th>Last Name</th>
        <th>Email Address</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="GroupStore.selectedGroup === null">
        <td class="student-list__select-group" colspan="5">Please select a group...</td>
      </tr>
      <template v-else>
        <tr
          v-for="student in StudentStore.students"
          :key="student.id"
          @click="studentClick(student)"
          class="student-list__student"
          :class="{ 'student-list__student--selected': selection.hasStudent(student) }"
        >
          <td><input type="checkbox" :checked="selection.hasStudent(student)" /></td>
          <td>{{student.accountNumber}}</td>
          <td>{{student.firstName}}</td>
          <td>{{student.lastName}}</td>
          <td>{{student.email}}</td>
        </tr>
      </template>
    </tbody>
  </table>
  <div class="student-list__pagination" v-if="StudentStore.pageInfo != null">
    <button :disabled="!StudentStore.pageInfo.hasPreviousPage" @click.passive="StudentStore.fetchPrevious">Previous</button>
    <button :disabled="!StudentStore.pageInfo.hasNextPage" @click.passive="StudentStore.fetchNext">Next</button>
  </div>
</template>

<script lang="ts">
import StudentStore from '@/store/modules/student';
import GroupStore from '@/store/modules/group';
import InstanceStore from '@/store/modules/instance';
import StudentSelection from '@/services/StudentSelectionService';
import { reactive, ref, watchEffect } from 'vue';
import Student from '@/@types/Student';
import Instance from '@/@types/Instance';

const delay = 300;
let timer: NodeJS.Timeout|null = null;

export default {
  setup() {
    const selection = reactive(new StudentSelection());
    const prevInstance = ref<Instance|null>(null);
    const clicks = ref(0);

    // When the group changes, fetch students for the new group
    watchEffect(() => {
      if (GroupStore.selectedGroup !== null) {
        StudentStore.fetchStudents({
          groupId: GroupStore.selectedGroup.id,
        });
      } else {
        StudentStore.clearStudents();
      }
    });

    // When the instance changes, clear the selection
    watchEffect(() => {
      if (InstanceStore.selectedInstance !== null) {
        if (InstanceStore.selectedInstance.id !== prevInstance.value?.id ?? true) {
          prevInstance.value = InstanceStore.selectedInstance;
          selection.clear();
        }
      }
    });

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

    /**
     * Single or double-click on a student.
     */
    function studentClick(student: Student) {
      clicks.value += 1;

      if (clicks.value === 1) {
        selection.toggleStudent(student);
        timer = setTimeout(() => {
          clicks.value = 0;
        }, delay);
      } else {
        if (timer === null) return;
        clearTimeout(timer);
        console.log('double-click!');
        selection.toggleStudent(student);
        clicks.value = 0;
      }
    }

    return {
      GroupStore,
      StudentStore,
      selection,
      resolve,
      studentClick,
    };
  },
};
</script>

<style lang="scss">
table.student-list {
  width: 100%;
  border-spacing: 0;

  &.student-list--loading {
    opacity: 0.4;
  }

  & tr {
    text-align: left;
  }

  & th:last-child,
  & td:last-child
  {
    text-align: right;
  }

  & thead th {
    padding: 0.25em 0.25em;
  }

  & tbody tr {
    cursor: pointer;

    & td {
      padding: 0.5em 0.25em;
      user-select: none;
    }

    &:nth-child(even) {
      $bgcolor: colorStep(secondary, $step: 0, $darken: false);
      background-color: $bgcolor;

      color: chooseColor(
        $bgcolor,
        map.get($theme, secondary, font-color),
        map.get($theme, secondary, font-color-alt)
      );
    }

    &:hover {
      $bgcolor: colorStep(secondary, $step: 3, $darken: true);
      background-color: $bgcolor;

      color: chooseColor(
        $bgcolor,
        map.get($theme, secondary, font-color),
        map.get($theme, secondary, font-color-alt)
      );
    }

    & .student-list__select-group {
      text-align: left;
    }

    &.student-list__student--selected {
      $bgcolor: colorStep(accent1, $step: 6, $darken: false);
      background-color: $bgcolor;

      color: chooseColor(
        $bgcolor,
        map.get($theme, accent1, font-color),
        map.get($theme, accent1, font-color-alt)
      );

      &:hover {
        $bgcolor: colorStep(accent1, $step: 4, $darken: false);
        background-color: $bgcolor;

        color: chooseColor(
          $bgcolor,
          map.get($theme, accent1, font-color),
          map.get($theme, accent1, font-color-alt)
        );
      }
    }
  }
}

div.student-list__pagination {
  text-align: center;

  & button {
    outline: none;
    border: none;
    background: none;
    cursor: pointer;
    margin: 1em;
    text-decoration: underline;
    overflow: visible;
  }
}
</style>
