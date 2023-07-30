<script lang="ts" setup>
import { ref, computed, watchEffect, watch } from 'vue';

import type { Student } from '@/common/services/student';

// Routing
import { useRouter } from 'vue-router';
import StudentRouteNames from '@/admin/students/routeNames';

// Services
import selection from '@/admin/groups/services/StudentSelectionService';

// Utils
import { GLOBAL_STORE } from '@/admin/symbols';
import injectStrict from '@/common/utils/injectStrict';

// Components
import { VCheckbox } from '@/common/components/inputs';

const router = useRouter();
const numClicks = ref(0);
const delay = 300;
let timer: ReturnType<typeof setTimeout> | null = null;

const globalStore = injectStrict(GLOBAL_STORE);
const selectedInstance = computed(() => globalStore.instance.selected.value);
const selectedGroup = computed(() => globalStore.group.selected.value);

function loginDateFormat(date?: string | null) {
  if (!date || date.trim().length === 0) return 'Never';
  return new Date(date).toLocaleDateString('en-US');
}

function registrationStatus(date?: string | null) {
  return !date || date.trim().length === 0 ? 'Unregistered' : 'Registered';
}

function handleClick(student: Student) {
  numClicks.value += 1;

  if (numClicks.value === 1) {
    selection.toggleStudent(student);

    timer = setTimeout(() => {
      numClicks.value = 0;
    }, delay);
  } else {
    if (!timer) return;
    clearTimeout(timer);
    selection.toggleStudent(student);
    numClicks.value = 0;
    router.push({
      name: StudentRouteNames.index,
      params: {
        studentId: student.id,
      },
    });
  }
}

watchEffect(() => {
  if (selectedGroup.value !== null) {
    globalStore.student.fetch({
      groupId: selectedGroup.value.id,
    });
  } else {
    globalStore.student.clear();
  }
});

watch(selectedInstance, (newValue, oldValue) => {
  if (!oldValue) return;

  if (newValue !== oldValue) {
    selection.clear();
  }
});

const {
  loading,
  students,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  fetchNext,
  fetchPrevious,
} = globalStore.student;
</script>

<template>
  <!-- eslint-disable vuejs-accessibility/form-control-has-label -->
  <div class="student-list" :class="{ 'student-list--loading': loading }">
    <div class="scroll-wrapper">
      <table class="student-list__list selectable">
        <thead>
          <tr>
            <th>
              <v-checkbox
                name="select-all"
                class="student-list__checkbox"
                :model-value="selection.hasGroup(selectedGroup)"
                @update:model-value="selection.toggleGroup(selectedGroup)"
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
            <td class="student-list__select-group center" colspan="7">
              Please select a group...
            </td>
          </tr>
          <template v-else>
            <tr
              v-for="student in students"
              :key="student.id"
              :class="{ selected: selection.hasStudent(student) }"
              class="student-list__student"
              @click="handleClick(student)"
            >
              <td>
                <v-checkbox
                  class="student-list__checkbox"
                  :name="`student-${student.id}`"
                  :model-value="selection.hasStudent(student)"
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
    </div>
    <div v-if="totalPages > 1" class="pagination-buttons">
      <button
        type="button"
        :disabled="!hasPreviousPage"
        @click.passive="fetchPrevious"
      >
        Previous
      </button>
      <button type="button" :disabled="!hasNextPage" @click.passive="fetchNext">
        Next
      </button>
    </div>
  </div>
</template>

<style scoped>
.student-list--wrapper {
  max-width: 100%;
  overflow-x: auto;
  display: block;
}

.student-list--loading {
  opacity: 0.4;
}

th .student-list__checkbox {
  margin-left: 0.25em;
}
</style>
