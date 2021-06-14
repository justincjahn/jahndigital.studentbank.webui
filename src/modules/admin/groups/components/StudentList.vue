<template>
  <div
    class="student-list"
    :class="{ 'student-list--loading': studentStore.loading.value }"
  >
    <table class="student-list__list selectable">
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
          <th>Last Login</th>
          <th>Registration</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="selectedGroup === null">
          <td
            class="student-list__select-group center"
            colspan="7"
          >
            Please select a group...
          </td>
        </tr>
        <template v-else>
          <tr
            v-for="student in studentStore.students.value"
            :key="student.id"
            :class="{ 'selected': selection.hasStudent(student) }"
            class="student-list__student"
            @click="studentClick(student)"
          >
            <td>
              <input
                type="checkbox"
                :checked="selection.hasStudent(student)"
              />
            </td>
            <td>{{ student.accountNumber }}</td>
            <td>{{ student.firstName }}</td>
            <td>{{ student.lastName }}</td>
            <td>{{ student.email }}</td>
            <td>{{ loginDateFormat(student.dateLastLogin) }}</td>
            <td>{{ registrationStatus(student.dateRegistered) }}</td>
          </tr>
        </template>
      </tbody>
    </table>
    <div
      v-if="studentStore.pageInfo.value != null"
      class="pagination-buttons"
    >
      <button
        :disabled="!studentStore.pageInfo.value.hasPreviousPage"
        @click.passive="studentStore.fetchPrevious"
      >
        Previous
      </button>
      <button
        :disabled="!studentStore.pageInfo.value.hasNextPage"
        @click.passive="studentStore.fetchNext"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watchEffect } from 'vue';

// Routing
import { useRouter } from 'vue-router';
import StudentRouteNames from '@/modules/admin/students/routeNames';

// Services
import selection from '@/services/StudentSelectionService';

// Stores
import { StudentStore } from '@/modules/admin/stores/student';
import { GroupStore } from '../stores/group';

const delay = 300;
let timer: number|null = null;

export default defineComponent({
  props: {
    groupStore: {
      type: Object as PropType<GroupStore>,
      required: true,
    },

    studentStore: {
      type: Object as PropType<StudentStore>,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const prevInstance = ref<Instance|null>(null);
    const clicks = ref(0);

    function loginDateFormat(date: string) {
      if (!date || date.trim().length === 0) return 'Never';
      return new Date(date).toLocaleDateString('en-US');
    }

    function registrationStatus(date: string) {
      if (!date || date.trim().length === 0) return 'Unregistered';
      return 'Registered';
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
        selection.toggleStudent(student);
        clicks.value = 0;
        router.push({
          name: StudentRouteNames.transactions,
          params: {
            studentId: student.id,
          },
        });
      }
    }

    // When the group changes, fetch students for the new group
    watchEffect(() => {
      if (props.groupStore.selected.value !== null) {
        props.studentStore.fetch({ groupId: props.groupStore.selected.value.id });
      } else {
        props.studentStore.clear();
      }
    });

    // When the instance changes, clear the selection
    watchEffect(() => {
      if (props.groupStore.instanceStore.selected.value !== null) {
        if (props.groupStore.instanceStore.selected.value.id !== prevInstance.value?.id ?? true) {
          prevInstance.value = props.groupStore.instanceStore.selected.value;
          selection.clear();
        }
      }
    });

    return {
      selectedGroup: props.groupStore.selected,
      loginDateFormat,
      registrationStatus,
      studentClick,
      selection,
    };
  },
});
</script>

<style lang="scss">
.student-list {
  width: 100%;

  &--loading {
    opacity: 0.4;
  }
}

// Collapse the table into rows instead of columns for small screens
@media screen and (max-width: 800px) {
  .student-list__list {
    & thead, & tbody, & th, & td, & tr {
      display: block;
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

    & tr + tr {
      border-top: 2px solid colorStep(secondary, $step: 4);
    }

    & tbody tr td {
      $size: 7em;

      position: relative;
      padding-left: $size;
      border: none;
      text-align: left !important;
      word-break: break-all;

      & + td {
        border-top: 1px solid colorStep(secondary, $step: 2);
      }

      &::before {
        position: absolute;
        top: 0.5em;
        left: 0.25em;
        width: $size;
        white-space: nowrap;
        font-weight: bold;
      }

      &:nth-of-type(1):not(.student-list__select-group)::before {
        content: 'Select';
        margin-left: 2em;
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

      &:nth-of-type(6)::before {
        content: 'Last Login';
      }

      &:nth-of-type(7)::before {
        content: 'Reg. Status';
      }
    }
  }
}
</style>
