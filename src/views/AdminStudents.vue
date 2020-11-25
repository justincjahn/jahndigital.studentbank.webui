<template>
  <StudentSelector @select="handleSelection" @clear="handleClear"/>

  <div class="student-info">
    <form @submit.prevent="handleSubmit" autocomplete="off">
      <div class="student-info--form-group">
        <label for="student-info__account-number">Account Number</label>
        <input
          type="text"
          id="student-info__account-number"
          v-model="accountNumber"
        />
        <p class="error" v-if="errors.accountNumber">{{errors.accountNumber}}</p>
      </div>
      <div class="student-info--form-group">
        <label for="student-info__email">Email</label>
        <input
          type="text"
          id="student-info__email"
          v-model="email"
        />
        <p class="error" v-if="errors.email">{{errors.email}}</p>
      </div>
      <div class="student-info--form-group">
        <label for="student-info__first-name">First Name</label>
        <input
          type="text"
          id="student-info__first-name"
          v-model="firstName"
        />
        <p class="error" v-if="errors.firstName">{{errors.firstName}}</p>
      </div>
      <div class="student-info--form-group">
        <label for="student-info__last-name">Last Name</label>
        <input
          type="text"
          id="student-info__last-name"
          v-model="lastName"
        />
        <p class="error" v-if="errors.lastName">{{errors.lastName}}</p>
      </div>
      <div class="student-info--submit-group">
        <input type="submit" class="primary" value="Update" />
      </div>
    </form>
  </div>

  <section class="sub-nav sub-nav--padded">
    <router-link :to="{name: 'StudentsTransactions', params}">Transactions</router-link>
    <router-link :to="{name: 'StudentsStocks', params}">Stocks</router-link>
    <router-link :to="{name: 'StudentsPurchases', params}">Purchases</router-link>
  </section>

  <div class="student-details">
    <router-view v-if="StudentStore.selectedStudent !== null" />
  </div>
</template>

<script lang="ts">
import Student from '@/@types/Student';
import StudentSelector from '@/components/StudentSelector.vue';
import StudentStore from '@/store/modules/student';
import GlobalStore from '@/store/modules/global';
import { useRouter, useRoute } from 'vue-router';
import { defineComponent, onMounted, ref, watch, watchEffect } from 'vue';
import { useField, useForm } from 'vee-validate';
import Apollo from '@/services/Apollo';
import gqlSearchAccounts from '@/graphql/studentsByAccountNumber.gql';
import gqlStudentById from '@/graphql/studentById.gql';
import PagedStudentResponse from '@/@types/graphql/PagedStudentResponse';

export default defineComponent({
  components: {
    StudentSelector,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    /**
     * Ensure the account number is less than 10 digits, and only digits.
     */
    function validateAccount(value: string): string|boolean {
      if (!value) {
        return 'Account number is required.';
      }

      if (value.length > 10) {
        return 'Account numbers cannot be more than 10 characters.';
      }

      if (!/^[0-9]+$/.test(value)) {
        return 'Account numbers can only contain numbers.';
      }

      return true;
    }

    /**
     * Ensure the account is unique across the instance.
     */
    async function validateAccountUnique(value: string): Promise<string|boolean> {
      const isValid = validateAccount(value);
      if (isValid !== true) return isValid;

      try {
        const res = await Apollo.query<PagedStudentResponse>({
          query: gqlSearchAccounts,
          variables: {
            accountNumber: value.padStart(10, '0'),
          },
        });

        if (!res.data || res.data.students.totalCount <= 0) return true;

        let i = 0;
        res.data.students.nodes.forEach((x) => {
          // Skip accounts not in the student's instance
          if (x.group?.instanceId !== StudentStore.selectedStudent?.group?.instanceId ?? false) {
            return;
          }

          if (x.id !== StudentStore.selectedStudent?.id ?? true) i += 1;
        });

        if (i > 0) return 'A student with the same account number already exists.';
      } catch {
        return 'Unable to contact server please try again later.';
      }

      return true;
    }

    /**
     * Ensure the email address is valid.
     */
    function validateEmail(value: string): string|boolean {
      if (!value) {
        return 'Email is required.';
      }

      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.]+\.[a-zA-Z-]+$/.test(value)) {
        return ' Email is invalid.';
      }

      return true;
    }

    /**
     * Ensure the names are valid.
     */
    function validateName(value: string): string|boolean {
      if (!value) {
        return 'First and last name are required.';
      }

      return true;
    }

    const form = useForm();
    const { value: accountNumber } = useField('accountNumber', validateAccountUnique);
    const { value: email } = useField('email', validateEmail);
    const { value: firstName } = useField('firstName', validateName);
    const { value: lastName } = useField('lastName', validateName);

    async function fetchStudentById(id: number) {
      try {
        const res = await Apollo.query<PagedStudentResponse>({
          query: gqlStudentById,
          variables: {
            id,
          },
        });

        if (res.data && res.data.students.nodes.length > 0) {
          const [student] = res.data.students.nodes;
          StudentStore.setSelectedStudent(student);
        }
      } catch (e) {
        console.log(e);
      }
    }

    /**
     * Set the route using the student id provided.
     */
    function setRoute(id: number) {
      router.push({
        name: route.name ?? 'Students',
        params: {
          ...route.params,
          studentId: id,
        },
      });
    }

    /**
     * Rehydrate the selectedStudent or fetch data using the route params.
     */
    onMounted(() => {
      if (route.params.studentId) {
        const studentId = parseInt(
          Array.isArray(route.params.studentId)
            ? route.params.studentId[0]
            : route.params.studentId,
          10,
        );

        if (Number.isNaN(studentId)) return;
        fetchStudentById(studentId);
      } else if (!route.params.studentId && StudentStore.selectedStudent !== null) {
        setRoute(StudentStore.selectedStudent.id);
      }
    });

    /**
     * Update the form values when the selected student changes
     */
    watchEffect(() => {
      if (!StudentStore.selectedStudent) return;
      form.setValues(StudentStore.selectedStudent);
    });

    /**
     * Handle when the user makes a selection in the search widget.
     */
    function handleSelection(student: Student) {
      setRoute(student.id);
      StudentStore.setSelectedStudent(student);
    }

    /**
     * Handle clearing the student search box.
     */
    function handleClear() {
      StudentStore.setSelectedStudent(null);
      form.resetForm();
    }

    /**
     * Fire off an update when the user submits the form.
     */
    const handleSubmit = form.handleSubmit(async (values) => {
      if (!StudentStore.selectedStudent) return;
      const merged = { ...StudentStore.selectedStudent, ...values } as Student;

      try {
        await StudentStore.updateStudent(merged);
      } catch (e) {
        GlobalStore.setCurrentError(e?.message ?? e);
      }
    });

    return {
      StudentSelector,
      StudentStore,
      handleSelection,
      handleClear,
      accountNumber,
      email,
      firstName,
      lastName,
      errors: form.errors,
      handleSubmit,
      params: route.params,
    };
  },
});
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
      flex-basis: 100%;
      text-align: center;

      & input[type=submit].primary {
        margin: 0;
      }
    }

    & p.error {
      text-align: right;
      font-size: 0.9em;
      color: map.get($theme, button-destructive, color);
    }
  }

  .student-details {
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
