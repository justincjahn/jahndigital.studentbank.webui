<template>
  <div
    class="student-list"
    :class="{ 'student-list--loading': loading }"
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
            v-for="student in students"
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
      v-if="totalPages > 1"
      class="pagination-buttons"
    >
      <button
        :disabled="!hasPrevious"
        @click.passive="fetchPrevious"
      >
        Previous
      </button>
      <button
        :disabled="!hasNext"
        @click.passive="fetchNext"
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
import { GlobalStore } from '../../stores/global';

const delay = 300;
let timer: number|null = null;

export default defineComponent({
  props: {
    store: {
      type: Object as PropType<GlobalStore>,
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
      if (props.store.group.selected.value !== null) {
        props.store.student.fetch({ groupId: props.store.group.selected.value.id });
      } else {
        props.store.student.clear();
      }
    });

    // When the instance changes, clear the selection
    watchEffect(() => {
      if (props.store.instance.selected.value !== null) {
        if (props.store.instance.selected.value.id !== prevInstance.value?.id ?? true) {
          prevInstance.value = props.store.instance.selected.value;
          selection.clear();
        }
      }
    });

    return {
      selectedGroup: props.store.group.selected,
      loginDateFormat,
      registrationStatus,
      studentClick,
      selection,
      loading: props.store.student.loading,
      students: props.store.student.students,
      totalPages: props.store.student.totalPages,
      hasPrevious: props.store.student.hasPreviousPage,
      hasNext: props.store.student.hasNextPage,
      fetchPrevious: props.store.student.fetchPrevious,
      fetchNext: props.store.student.fetchNext,
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
  $size: 7em;

  .student-list__list {
    & thead, & tbody, & th, & td, & tr {
      display: block;
    }

    & thead th {
      display: none;

      &:first-child {
        display: block;
        position: relative;
        padding-left: $size;
        margin-bottom: 1em;

        &::before {
          position: absolute;
          top: 0;
          left: 0.25em;
          width: $size;
          white-space: nowrap;
          font-weight: bold;
          padding-right: 1em;
          text-align: right;
          position: absolute;
          content: 'Select All';
        }
      }
    }

    & tr + tr {
      border-top: 2px solid colorStep(secondary, $step: 4);
    }

    & tbody tr td {
      position: relative;
      padding-left: $size;
      text-align: right;
      padding-right: 1em;
      border: none;
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
        padding-right: 1em;
        text-align: right;
      }

      &:nth-of-type(1):not(.student-list__select-group)::before {
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
