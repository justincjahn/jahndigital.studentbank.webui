<template>
  <StudentSelector @select="handleSelection" @clear="handleClear"/>

  <div class="student-info">
    <form @submit.prevent>
      <div class="student-info--form-group">
        <label for="student-info__account-number">Account Number</label>
        <input type="text" id="student-info__account-number" :value="StudentStore.selectedStudent?.accountNumber ?? ''"/>
      </div>
      <div class="student-info--form-group">
        <label for="student-info__email">Email</label>
        <input type="text" id="student-info__email" />
      </div>
      <div class="student-info--form-group">
        <label for="student-info__first-name">First Name</label>
        <input type="text" id="student-info__first-name" />
      </div>
      <div class="student-info--form-group">
        <label for="student-info__last-name">Last Name</label>
        <input type="text" id="student-info__last-name" />
      </div>
    </form>
    <div class="student-info--submit-group">
      <input type="submit" class="primary" value="Update" />
    </div>
  </div>

  <section class="sub-nav sub-nav--padded">
    <a href="#">Transactions</a>
    <a href="#">Stocks</a>
    <a href="#">Purchases</a>
  </section>

  <div class="student-transactions">
    Hello World!
  </div>
</template>

<script lang="ts">
import Student from '@/@types/Student';
import StudentSelector from '@/components/StudentSelector.vue';
import StudentStore from '@/store/modules/student';

export default {
  setup() {
    function handleSelection(student: Student) {
      StudentStore.setSelectedStudent(student);
    }

    function handleClear() {
      StudentStore.setSelectedStudent(null);
    }

    return {
      StudentSelector,
      StudentStore,
      handleSelection,
      handleClear,
    };
  },
};
</script>

<style lang="scss">
  .student-info {
    margin-top: 1.5em;
    padding: 1em;
    background-color: colorStep(secondary);

    & form {
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      gap: 1.5em;
    }

    & input {
      width: 100%;
    }

    &--submit-group {
      margin-top: 1.5em;
      flex-basis: 100%;
      text-align: center;
    }
  }

  .student-transactions {
    padding: 0 1.5em;
  }

  @media only screen and (min-width: 760px) {
    .student-info {
      & form {
        flex-direction: row;
      }

      & label {
        display: inline-block;
        width: 150px;
        text-align: right;
        padding-right: 0.5em;
      }

      & input[type=text] {
        width: clamp(200px, 25vw, 400px);
      }

      & input[type=submit] {
        width: inherit;
      }
    }
  }
</style>
