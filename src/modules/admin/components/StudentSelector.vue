<template>
  <div class="student-selector" :class="open ? 'open' : 'closed'">
    <form @submit.prevent @reset.prevent="handleClear">
      <label :for="formId">
        <slot>Search</slot>
      </label>

      <div class="student-selector__input">
        <span class="student-selector__input--wrapper">
          <input
            :id="formId"
            ref="input"
            v-model="searchCriteria"
            type="text"
            name="selected"
            autocomplete="off"
            @keydown="handleKeydown"
            @keyup="handleKeypress"
            @blur="handleBlur"
            @focus="handleFocus"
          />

          <input type="reset" value="X" />
        </span>

        <ul class="student-selector__student-list" :class="{ loading }">
          <template v-if="instanceStudents.length > 0">
            <student-selector-student
              v-for="student in instanceStudents"
              :key="student.id"
              :student="student"
              :highlighted="highlighted"
              @click="handleClick"
            />
          </template>

          <li v-else class="student-selector__student-list--message">
            <em v-if="loading">Loading...</em>
            <em v-else-if="searchCriteria.trim().length === 0">
              Enter a search term...
            </em>
            <em v-else>
              No students found...
            </em>
          </li>
        </ul>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch } from 'vue';

// Utils
import injectStrict from '@/utils/injectStrict';
import uuid4 from '@/utils/uuid4';

// Services
import { getStudentsByAccountNumber, getStudentsByEmail, getStudentsByName } from '@/services/student';

// Stores
import { INSTANCE_STORE_SYMBOL } from '../symbols';

// Components
import StudentSelectorStudent from './StudentSelectorStudent.vue';

export default defineComponent({
  components: {
    StudentSelectorStudent,
  },
  props: {
    modelValue: {
      type: Object as PropType<Student|null>,
      default: null,
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup(props, { emit }) {
    let timerId = -1;
    const input = ref<HTMLInputElement|null>(null);
    const formId = `student-selector__student-input--${uuid4()}`;
    const searchCriteria = ref('');
    const open = ref(false);
    const students = ref<Student[]>([]);
    const highlighted = ref<Student|null>(null);
    const loading = ref(false);
    const tabPressed = ref(false);

    // The service returns all students, we just want our selected instance
    const instanceStore = injectStrict(INSTANCE_STORE_SYMBOL);
    const instanceStudents = computed<Student[]>(() => {
      const selectedInstanceId = instanceStore.selected.value?.id ?? -1;
      if (selectedInstanceId === -1) return [];

      return students.value.filter((student) => {
        const instanceId = student.group?.instanceId ?? -1;
        return selectedInstanceId === instanceId;
      });
    });

    /**
     * Reset the selector to a default state.
     */
    function clear() {
      searchCriteria.value = '';
      open.value = false;
      tabPressed.value = false;
      loading.value = false;
      students.value = [];
      highlighted.value = null;
    }

    /**
     * Move the highlighted student up or down
     */
    function handleHighlight(increment = true) {
      const { length } = instanceStudents.value;
      if (length === 0) return;

      const idx = instanceStudents.value
        .findIndex((x) => x.id === highlighted.value?.id ?? -1);

      if (idx < 0) {
        if (length > 0) {
          highlighted.value = (increment)
            ? instanceStudents.value[0]
            : instanceStudents.value[length - 1];
        }

        return;
      }

      const i = increment ? 1 : -1;
      const newIdx = idx + i;
      if (newIdx < 0 || newIdx > length - 1) {
        // Wrap back to beginning
        [highlighted.value] = instanceStudents.value;
      } else {
        // Move forward/backward
        highlighted.value = instanceStudents.value[newIdx];
      }
    }

    /**
     * Tell the parent to select the student.
     */
    function handleClick(student: Student) {
      emit('update:modelValue', student);
      open.value = false;
    }

    /**
     * Tell the parent to clear the student.
     */
    function handleClear() {
      emit('update:modelValue', null);
    }

    /**
     * When the user clicks into the input, open the selection window.
     */
    function handleFocus(event: FocusEvent) {
      if (event.target) {
        (event.target as HTMLInputElement).select();
      }

      open.value = true;
    }

    /**
     * When the user clicks away from the input, close the selection window.
     */
    function handleBlur() {
      if (tabPressed.value) {
        const highlighedId = highlighted.value?.id ?? -1;
        const modelId = props.modelValue?.id ?? -1;

        if (highlighted.value && highlighedId !== modelId) {
          handleClick(highlighted.value);
        }

        open.value = false;
        tabPressed.value = false;
        return;
      }

      // Closing too quickly makes click events fail
      window.setTimeout(() => { open.value = false; }, 250);
    }

    /**
     * Fetch students by name, account number, or email address based on
     * the contents of the form.
     */
    async function fetchStudents() {
      let res: PagedStudentResponse|null = null;
      if (searchCriteria.value.indexOf('@') >= 0) {
        try {
          res = await getStudentsByEmail({
            email: searchCriteria.value,
          });
        } catch (e) {
          console.log(e);
        }
      } else if (/^[0-9]+$/.test(searchCriteria.value)) {
        try {
          res = await getStudentsByAccountNumber({
            accountNumber: searchCriteria.value,
          });
        } catch (e) {
          console.log(e);
        }
      } else {
        try {
          res = await getStudentsByName({
            name: searchCriteria.value,
          });
        } catch (e) {
          console.log(e);
        }
      }

      loading.value = false;
      if (res && res.students) {
        students.value = res.students.nodes;
        highlighted.value = null;
        handleHighlight();
      }
    }

    /**
     * When the user presses tab to leave the input box, capture it for later use
     * in the onBlur event.
     */
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        tabPressed.value = true;
      }
    }

    /**
     * When the user is focused on the input element, and presses a key,
     * move the highlight to another student, or fetch from the store.
     */
    function handleKeypress(e: KeyboardEvent) {
      if (e.altKey || e.ctrlKey) {
        return;
      }

      if (e.key === 'Escape' && input.value) {
        input.value.blur();
        open.value = false;
      }

      if (e.key === 'Enter' && highlighted.value) {
        if (highlighted.value.id !== (props.modelValue?.id ?? -1)) {
          handleClick(highlighted.value);
        } else if (input.value) {
          input.value.blur();
          open.value = false;
        }

        return;
      }

      if (e.key === 'ArrowUp' && open.value) {
        e.preventDefault();
        handleHighlight(false);
        return;
      }

      if (e.key === 'ArrowDown' && open.value) {
        e.preventDefault();
        handleHighlight();
        return;
      }

      if (e.key.length !== 1 && e.key !== 'Backspace') {
        return;
      }

      if (timerId > 0) {
        window.clearTimeout(timerId);
        loading.value = false;
      }

      if (searchCriteria.value.length > 0) {
        loading.value = true;
        timerId = window.setTimeout(fetchStudents, 750);
      }
    }

    watch(() => props.modelValue, (newValue) => {
      clear();

      if (!newValue) {
        highlighted.value = null;
      } else {
        highlighted.value = newValue;
        searchCriteria.value = newValue.accountNumber;

        // Only fetch if the student isn't already listed
        if (!students.value.find((x) => x.id === (highlighted.value?.id ?? -1))) {
          fetchStudents();
        }
      }
    });

    return {
      input,
      formId,
      searchCriteria,
      open,
      students,
      highlighted,
      loading,
      instanceStudents,
      handleClick,
      handleClear,
      handleFocus,
      handleBlur,
      handleKeydown,
      handleKeypress,
    };
  },
});
</script>

<style lang="scss">
  .student-selector {
    width: 100%;
    padding: 0 0.5em;

    form {
      display: flex;
      flex-direction: column;
    }

    &__input {
      position: relative;
      flex-grow: 1;

      &--wrapper {
        display: inline-block;
        position: relative;
        width: 100%;

        input[type=text] {
          width: 100%;
          padding-right: 3em;
          outline: none;

          &:focus {
            border: 1px solid colorStep(button-secondary, $step: 4);
          }
        }

        input[type=reset] {
          @include input-reset;
          position: absolute;
          top: 0;
          right: 0;
          width: 3em;
          height: 100%;
        }
      }
    }

    &__student-list {
      display: none;
      position: absolute;
      width: 100%;
      z-index: 800;

      max-height: 40vh;
      overflow-y: auto;

      list-style: none;
      margin: 0;
      padding: 0;

      font-size: 0.9em;
      background-color: map.get($theme, button-secondary, color);
      border: 1px solid colorStep(button-secondary, $step: 4);
      border-top: none;
      border-radius: 0 0 3px 3px;

      &.loading li {
        opacity: 0.5;
      }

      &--message {
        padding: 0.5em;
      }

      li + li {
        border-top: 1px solid rgba(0, 0, 0, 0.1);
      }
    }

    &.open &__student-list {
      display: block;
    }

    &.open input[type=text] {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      border-bottom: 1px solid colorStep(button-secondary, $step: 3);
    }

    @media only screen and (min-width: 760px) {
      form {
        flex-direction: row;
        align-items: center;

        label {
          padding-right: 1em;
        }
      }
    }
  }
</style>
