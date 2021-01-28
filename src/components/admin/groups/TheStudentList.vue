<template>
  <div class="student-list" :class="{ 'student-list--loading': studentStore.loading.value }">
    <table class="student-list__list">
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              :checked="selection.hasGroup(selectedGroup)"
              @click="selection.toggleGroup(selectedGroup)"
            />
          </th>
          <th>Account Number</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Email Address</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="selectedGroup === null">
          <td class="student-list__select-group" colspan="5">Please select a group...</td>
        </tr>
        <template v-else>
          <tr
            v-for="student in studentStore.students.value"
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
    <div class="student-list__pagination" v-if="studentStore.pageInfo.value != null">
      <button :disabled="!studentStore.pageInfo.value.hasPreviousPage" @click.passive="studentStore.fetchPrevious">Previous</button>
      <button :disabled="!studentStore.pageInfo.value.hasNextPage" @click.passive="studentStore.fetchNext">Next</button>
    </div>
  </div>
</template>

<script lang="ts">
import studentStore from '@/store/student';
import groupStore from '@/store/group';
import selection from '@/services/StudentSelectionService';
import { ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

const delay = 300;
let timer: NodeJS.Timeout|null = null;

export default {
  setup() {
    const router = useRouter();
    const prevInstance = ref<Instance|null>(null);
    const clicks = ref(0);

    // When the group changes, fetch students for the new group
    watchEffect(() => {
      if (groupStore.selected.value !== null) {
        studentStore.fetch({ groupId: groupStore.selected.value.id });
      } else {
        studentStore.clear();
      }
    });

    // When the instance changes, clear the selection
    watchEffect(() => {
      if (groupStore.instanceStore.selected.value !== null) {
        if (groupStore.instanceStore.selected.value.id !== prevInstance.value?.id ?? true) {
          prevInstance.value = groupStore.instanceStore.selected.value;
          selection.clear();
        }
      }
    });

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
        selection.toggleStudent(student);
        clicks.value = 0;
        router.push({
          name: 'StudentsTransactions',
          params: {
            studentId: student.id,
          },
        });
      }
    }

    return {
      selectedGroup: groupStore.selected,
      studentStore,
      studentClick,
      selection,
    };
  },
};
</script>

<style lang="scss">
.student-list {
  width: 100%;

  &--loading {
    opacity: 0.4;
  }
}

.student-list__list {
  width: 100%;
  border-spacing: 0;

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

      &.student-list__select-group {
        text-align: left;
      }
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

.student-list__pagination {
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

// Collapse the table into rows instead of columns for small screens
@media screen and (max-width: 800px) {
  .student-list__list {
    & thead, & tbody, & th, & td, & tr {
      display: block;
    }

    & tr {
      border: 1px solid colorStep(secondary, $step: 6);
    }

    & thead th {
      display: none;

      &:first-child {
        display: block;
        position: relative;
        padding-left: 95px;

        &::before {
          position: absolute;
          content: 'Select All';
          left: 0.25em;
          top: 0.2em;
        }
      }
    }

    & tbody tr td {
      position: relative;
      padding-left: 95px;
      border: none;
      border-bottom: 1px solid colorStep(secondary, $step: 2);

      word-break: break-all;

      &::before {
        position: absolute;
        top: 0.5em;
        left: 0.25em;
        width: 95px;
        white-space: nowrap;
      }

      &:nth-of-type(1)::before {
        content: 'Select';
      }

      &:nth-of-type(2)::before {
        content: 'Account #';
      }

      &:nth-of-type(3)::before {
        content: 'First Name';
      }

      &:nth-of-type(4)::before {
        content: 'Last Name';
      }

      &:nth-of-type(5)::before {
        content: 'Email';
      }
    }

    & th:last-child,
    & td:last-child
    {
      text-align: left;
    }
  }
}
</style>
