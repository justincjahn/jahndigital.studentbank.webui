<template>
  <div class="student-search" :class="{open: isOpen}">
    <form @submit.prevent="handleSelection" @reset="handleReset">
      <label for="student-search__input__input">Search</label>

      <div class="student-search__input">
        <span class="student-search__input__reset-wrapper">
          <input
            type="text"
            id="student-search__input__input"
            autocomplete="off"
            v-model="searchCriteria"
            @keyup="handleKeypress"
            @blur="handleClose"
            @focus="handleOpen"
          />
          <input type="reset" value="X" />
        </span>

        <ul class="student-search__input__results" ref="resultElements">
          <li
            class="student-search__input__results__item"
            v-if="instanceStudents.length === 0"
          >
            <em>No students in active instance...</em>
          </li>

          <li
            class="student-search__input__results__item selectable"
            v-for="student in instanceStudents"
            :key="student.id"
            :class="{ selected: selection === student}"
            @click="handleSelection(student)"
          >
            <span class="student-search__input__results__item--account-number">{{student.accountNumber}}</span>
            <span class="student-search__input__results__item--name">{{student.lastName}}, {{student.firstName}}</span>
            <span class="student-search__input__results__item--email">{{student.email}}</span>

            <ul class="student-search__input__results__item__shares">
              <li
                class="student-search__input__results__item__shares__item"
                v-for="share in student.shares ?? []"
                :key="share.id"
              >
                <span class="student-search__input__results__item__shares__item--name">{{share.shareType.name.substring(0, 3).toUpperCase()}}</span>
                <span class="student-search__input__results__item__shares__item--balance">${{share.balance}}</span>
              </li>
            </ul>
          </li>

          <hr v-if="otherStudents.length > 0" />

          <li
            class="student-search__input__results__item selectable"
            v-for="student in otherStudents"
            :key="student.id"
            :class="{ selected: selection === student}"
            @click="handleSelection(student)"
          >
            <span class="student-search__input__results__item--account-number">{{student.accountNumber}}</span>
            <span class="student-search__input__results__item--name">{{student.lastName}}, {{student.firstName}}</span>
            <span class="student-search__input__results__item--email">{{student.email}}</span>

            <ul class="student-search__input__results__item__shares">
              <li
                class="student-search__input__results__item__shares__item"
                v-for="share in student.shares ?? []"
                :key="share.id"
              >
                <span class="student-search__input__results__item__shares__item--name">{{share.shareType.name.substring(0, 3).toUpperCase()}}</span>
                <span class="student-search__input__results__item__shares__item--balance">${{share.balance}}</span>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import InstanceStore from '@/store/modules/instance';
import apolloClient from '@/services/Apollo';
import gqlStudentsWithName from '@/graphql/studentsByName.gql';
import gqlStudentsWithEmail from '@/graphql/studentsByEmail.gql';
import gqlStudentsWithAccountNumber from '@/graphql/studentsByAccountNumber.gql';
import { ref, defineComponent } from 'vue';
import PagedStudentResponse from '@/@types/graphql/PagedStudentResponse';
import Student from '@/@types/Student';

export default defineComponent({
  setup(_, { emit }) {
    const searchCriteria = ref('');
    const timerFunc = ref<number>(-1);
    const isOpen = ref(false);
    const instanceStudents = ref<Student[]>([]);
    const otherStudents = ref<Student[]>([]);
    const selection = ref<Student|null>(null);
    const resultElements = ref<HTMLElement|null>(null);
    const inputElement = ref<HTMLInputElement|null>(null);

    /**
     * Split the student list into two arrays for our template.
     */
    function processStudents(students: Student[]) {
      const iid = InstanceStore.selectedInstance?.id || -1;
      instanceStudents.value = students.filter((x) => x.group?.instanceId === iid ?? false);
      otherStudents.value = students.filter((x) => x.group?.instanceId !== iid ?? true);

      if (instanceStudents.value.length > 0) {
        // eslint-disable-next-line prefer-destructuring
        selection.value = instanceStudents.value[0];
      } else if (otherStudents.value.length > 0) {
        // eslint-disable-next-line prefer-destructuring
        selection.value = otherStudents.value[0];
      }
    }

    /**
     * Move the selection to the next student.
     */
    function incrementSelection() {
      const scrollEl = resultElements.value?.querySelector('li.selected ~ li.selectable') ?? null;

      let index = instanceStudents.value.findIndex((x) => x.id === selection.value?.id ?? -1);
      if (index >= 0 && instanceStudents.value.length - 1 > index) {
        selection.value = instanceStudents.value[index + 1];
        if (scrollEl != null) scrollEl.scrollIntoView();
        return;
      }

      index = otherStudents.value.findIndex((x) => x.id === selection.value?.id ?? -1);
      if (index <= 0 && otherStudents.value.length > 0) {
        // eslint-disable-next-line prefer-destructuring
        selection.value = otherStudents.value[0];
      }

      if (index >= 0 && otherStudents.value.length - 1 > index) {
        selection.value = otherStudents.value[index + 1];
      }

      if (scrollEl != null) scrollEl.scrollIntoView();
    }

    /**
     * Move the selection to the previous student.
     */
    function decrementSelection() {
      const scrollEl = resultElements.value?.querySelector('li.selected') ?? null;

      let index = instanceStudents.value.findIndex((x) => x.id === selection.value?.id ?? -1);
      if (index >= 0 && index - 1 >= 0) {
        selection.value = instanceStudents.value[index - 1];

        if (scrollEl != null) {
          const sibling = scrollEl.previousElementSibling;
          if (sibling != null) sibling.scrollIntoView();
        }

        return;
      }

      index = otherStudents.value.findIndex((x) => x.id === selection.value?.id ?? -1);

      if (index < 0) {
        return;
      }

      if (index >= 0 && index - 1 >= 0) {
        selection.value = otherStudents.value[index - 1];
      } else if (instanceStudents.value.length > 0) {
        selection.value = instanceStudents.value[instanceStudents.value.length - 1];
      }

      if (scrollEl != null) {
        const sibling = scrollEl.previousElementSibling;
        if (sibling != null) sibling.scrollIntoView();
      }
    }

    /**
     * Query the server for students
     */
    async function search() {
      isOpen.value = true;

      if (searchCriteria.value.indexOf('@') >= 0) {
        try {
          const response = await apolloClient.query<PagedStudentResponse>({
            query: gqlStudentsWithEmail,
            variables: {
              email: searchCriteria.value,
            },
          });

          processStudents(response.data.students.nodes);
        } catch (e) {
          console.log(e);
        }
      } else if (/^[0-9]+$/.test(searchCriteria.value)) {
        try {
          const response = await apolloClient.query<PagedStudentResponse>({
            query: gqlStudentsWithAccountNumber,
            variables: {
              accountNumber: searchCriteria.value,
            },
          });

          processStudents(response.data.students.nodes);
        } catch (e) {
          console.log(e);
        }
      } else {
        try {
          const response = await apolloClient.query<PagedStudentResponse>({
            query: gqlStudentsWithName,
            variables: {
              name: searchCriteria.value,
            },
          });

          processStudents(response.data.students.nodes);
        } catch (e) {
          console.log(e);
        }
      }
    }

    /**
     * Open the results panel if the user clicks and there's a value.
     */
    function handleOpen() {
      if (searchCriteria.value.length === 0) {
        return;
      }

      if (instanceStudents.value.length > 0 || otherStudents.value.length > 0) {
        isOpen.value = true;
      }
    }

    /**
     * Select students and update the store.
     */
    function handleSelection(student?: Student) {
      if (student && student.id) {
        selection.value = student;
        emit('select', student);
      } else {
        emit('select', selection.value);
      }

      isOpen.value = false;
    }

    /**
     * Close the results panel.
     */
    function handleClose() {
      // If we close too quickly, the click event for selections won't work
      setTimeout(() => {
        isOpen.value = false;
      }, 250);
    }

    /**
     * Reset form text and clear selection.
     */
    function handleReset() {
      searchCriteria.value = '';
      selection.value = null;
      emit('clear');
    }

    /**
     * When the user stops typing, run the search.
     */
    function handleKeypress(e: KeyboardEvent) {
      if (e.altKey || e.ctrlKey) {
        return;
      }

      if (e.key === 'ArrowUp' && isOpen.value) {
        e.preventDefault();
        decrementSelection();
        return;
      }

      if (e.key === 'ArrowDown' && isOpen.value) {
        e.preventDefault();
        incrementSelection();
        return;
      }

      if (e.key.length !== 1 && e.key !== 'Backspace') {
        return;
      }

      window.clearTimeout(timerFunc.value);

      if (searchCriteria.value.length > 0) {
        timerFunc.value = window.setTimeout(search, 750);
      }
    }

    return {
      handleKeypress,
      handleClose,
      handleOpen,
      handleSelection,
      handleReset,
      searchCriteria,
      isOpen,
      instanceStudents,
      otherStudents,
      selection,
      resultElements,
      inputElement,
    };
  },
});
</script>

<style lang="scss">
  .student-search {
    margin: 0 1.5em;

    label[for=student-search__input__input] {
      padding-right: 1em;
      margin: auto 0;
    }

    & form {
      display: flex;
      flex-direction: column;
    }

    &__input {
      position: relative;

      &__reset-wrapper {
        width: 100%;
        display: inline-block;

        input[type=reset] {
          @include input-reset;
        }
      }

      &__results {
        display: none;
        position: absolute;
        z-index: 1;
        list-style: none;
        margin: 0;
        width: 100%;
        max-height: 40vh;
        overflow: auto;

        background-color: map.get($theme, button-secondary, color);
        border: 1px solid colorStep(button-secondary, $step: 2);

        &__item {
          font-size: 0.85em;
          padding: 0.25em;

          &.selectable {
            cursor: pointer;

            &:hover {
              background-color: colorStep(button-secondary);
            }
          }

          &.selected {
            background-color: colorStep(button-secondary);
          }

          &--account-number {
            font-family: Consolas, 'Courier New', Courier, monospace;

            &:after {
              content: ' ';
            }
          }

          &--email {
            display: block;
            font-style: italic;
          }

          &__shares {
            margin-top: 0.25em;
            font-size: 0.9em;
            list-style: none;

            &__item {
              padding-left: 1em;

              &--name {
                font-weight: 300;

                &:after {
                  content: ': ';
                }
              }
            }
          }
        }
      }
    }

    &.open {
      & .student-search__input__results {
        display: block;
      }

      & #student-search__input__input {
        border-radius: 0.25rem 0.25rem 0px 0px;
      }
    }
  }

  #student-search__input__input {
    width: 100%;
    border-radius: 0.25em;
    outline: none;

    &:focus {
      border-color: colorStep(button-primary, $darken: false, $step: 4);
    }
  }

  @media only screen and (min-width: 760px) {
    .student-search {
      & form {
        flex-direction: row;
      }

      &__input {
        &__reset-wrapper {
          width: clamp(300px, 30vw, 400px);
        }
      }
    }
  }
</style>
