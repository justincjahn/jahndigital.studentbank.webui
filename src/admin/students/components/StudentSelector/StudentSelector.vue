<script setup lang="ts">
import { ref, watch } from 'vue';

// Types
import type { Student } from '@/common/services/student';
import type { GlobalStore } from '@/admin/common/stores/global';

// Services
import {
  getStudentsByAccountNumber,
  getStudentsByEmail,
  getStudentsByName,
} from '@/common/services/student';

// Utils
import useDebounce from '@/common/composables/useDebounce';

// Components
import { VSelect, VOption, VInput } from '@/common/components/inputs';
import StudentSelectorStudent from './StudentSelectorStudent.vue';

const props = withDefaults(
  defineProps<{
    modelValue: Student | null;

    // The store to use when limiting the scope to an instance
    store: GlobalStore;

    // A unique name for this component
    name?: string;

    // A unique ID for this component
    id?: string;

    // The prompt to use when there's currently no item selected
    prompt?: string;

    // The label displayed above the select box
    label?: string;

    // Helper text displayed above the select box
    helpText?: string;

    // The width of the select element
    width?: string;

    // If the entire select element is disabled
    disabled?: boolean;

    // If the value is required
    required?: boolean;
  }>(),
  {
    prompt: 'Search...',
    name: undefined,
    id: undefined,
    label: undefined,
    helpText: undefined,
    width: '20rem',
    disabled: undefined,
    required: undefined,
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: Student | null): void;
}>();

const searchCriteria = ref('');
const searchResults = ref<Student[]>([]);
const shouldToggle = ref(false);
const isOpen = ref(false);
const isLoading = ref(false);

function filterOptions(students: Student[]) {
  const instanceId = props.store.instance.selected.value?.id ?? -1;

  searchResults.value = students.filter(
    (student) => (student.group?.instanceId ?? -1) === instanceId
  );
}

const startSearch = useDebounce(async () => {
  const criteria = searchCriteria.value.trim();

  if (criteria === props.modelValue?.accountNumber ?? false) {
    return;
  }

  searchResults.value = [];

  if (criteria.length === 0) {
    return;
  }

  isLoading.value = true;

  if (!isOpen.value) {
    shouldToggle.value = true;
  }

  if (criteria.match(/^[0-9]+$/)) {
    try {
      const students = await getStudentsByAccountNumber({
        accountNumber: criteria,
        first: 10,
      });

      filterOptions(students?.students?.nodes ?? []);
    } finally {
      isLoading.value = false;
    }

    return;
  }

  if (criteria.indexOf('@') > 0) {
    try {
      const students = await getStudentsByEmail({
        email: criteria,
        first: 10,
      });

      filterOptions(students?.students?.nodes ?? []);
    } finally {
      isLoading.value = false;
    }

    return;
  }

  try {
    const students = await getStudentsByName({
      name: criteria,
      first: 10,
    });

    filterOptions(students?.students?.nodes ?? []);
  } finally {
    isLoading.value = false;
  }
}, 500);

function onClear() {
  emit('update:modelValue', null);
}

/**
 * Bubble up the modelValue to our parent.
 */
function handleUpdate(item: unknown) {
  emit('update:modelValue', item as Student);
}

/**
 * Fired when the VSelect component is toggled.
 */
function onToggle(value: boolean) {
  isOpen.value = value;
}

/**
 * Fired as the user is typing in the input control.
 */
function onKeydown(e: KeyboardEvent) {
  switch (e.code) {
    case 'ArrowDown':
    case 'Enter': {
      if (!isOpen.value) {
        shouldToggle.value = true;
      }

      break;
    }
    default:
    // Nothing
  }
}

// Trigger a search every time the user types something.
watch(searchCriteria, () => {
  startSearch();
});

watch(
  () => props.modelValue,

  (newValue) => {
    if (newValue === null) {
      searchCriteria.value = '';
    } else {
      searchCriteria.value = (newValue as Student).accountNumber;
    }
  }
);
</script>

<template>
  <v-select
    v-bind="{ ...props, ...$attrs }"
    v-model:should-toggle="shouldToggle"
    @update:model-value="handleUpdate"
    @toggle="onToggle"
  >
    <template #activator="{ activate, attrs }">
      <v-input
        v-model="searchCriteria"
        :disabled="disabled"
        :attrs="attrs"
        :style="{ width }"
        :placeholder="prompt"
        class="student-selector__input"
        @focus="activate"
        @keydown="onKeydown"
      >
        <template #after>
          <button
            type="button"
            class="student-selector__input__clear"
            @click="onClear"
          >
            X
          </button>
        </template>
      </v-input>
    </template>

    <v-option v-if="searchCriteria.trim().length === 0" disabled>
      Please enter your search criteria.
    </v-option>

    <v-option v-if="searchCriteria.trim().length > 0" disabled>
      <template v-if="isLoading">Loading...</template>

      <template v-else-if="searchResults.length === 0">
        No results found...
      </template>
    </v-option>

    <v-option
      v-for="student of searchResults"
      :key="student.id"
      :value="student"
    >
      <student-selector-student :model-value="student" />
    </v-option>
  </v-select>
</template>

<style scoped>
.student-selector__input {
  position: relative;
  margin-right: 1ch;
}

.student-selector__input__clear {
  position: absolute;
  padding: 0;
  margin: 0;
  height: fit-content;
  width: fit-content;
  min-width: 0;
  background-color: transparent;
  border: none;
  top: calc(50% - 1ch);
  right: 1ch;
  font-size: 0.8em;
  cursor: pointer;
  color: hsl(var(--clr-neutral-900) / 0.5);
}
</style>
