<template>
  <suspense>
    <student-selector @select="handleSelection" @clear="handleClear"/>
  </suspense>

  <div class="student-info">
    <form @submit.prevent="handleSubmit" autocomplete="off">
      <div class="student-info--form-group">
        <label for="student-info__account-number">Account Number</label>
        <Field
          name="accountNumber"
          type="text"
          id="student-info__account-number"
        />
        <p class="error" v-if="errors.accountNumber">{{errors.accountNumber}}</p>
      </div>
      <div class="student-info--form-group">
        <label for="student-info__email">Email</label>
        <Field
          name="email"
          type="text"
          id="student-info__email"
        />
        <p class="error" v-if="errors.email">{{errors.email}}</p>
      </div>
      <div class="student-info--form-group">
        <label for="student-info__first-name">First Name</label>
        <Field
          name="firstName"
          type="text"
          id="student-info__first-name"
        />
        <p class="error" v-if="errors.firstName">{{errors.firstName}}</p>
      </div>
      <div class="student-info--form-group">
        <label for="student-info__last-name">Last Name</label>
        <Field
          name="lastName"
          type="text"
          id="student-info__last-name"
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
    <router-view v-if="studentStore.selected.value !== null" />
  </div>
</template>

<script lang="ts">
import studentStore from '@/store/student';
import errorStore from '@/store/error';
import { useRouter, useRoute } from 'vue-router';
import { defineComponent, onMounted, computed, defineAsyncComponent } from 'vue';
import { Field, useForm } from 'vee-validate';
import Apollo from '@/services/Apollo';
import gqlStudentById from '@/graphql/studentById.gql';
import { validateAccountUnique, validateEmail, validateName } from '@/utils/validators';

const validateAccount = validateAccountUnique({ studentStore });

/**
 * Handles high-level selection of students and routing to sub-routes.
 */
export default defineComponent({
  components: {
    StudentSelector: defineAsyncComponent(() => import(/* webpackChunkName: "admin-students" */ '@/components/StudentSelector.vue')),
    Field,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    const form = useForm({
      validationSchema: {
        accountNumber: validateAccount,
        email: validateEmail,
        firstName: validateName,
        lastName: validateName,
      },
    });

    /**
     * Fire off an update when the user submits the form.
     */
    const handleSubmit = form.handleSubmit(async (values) => {
      if (!studentStore.selected.value) return;
      const merged = { ...studentStore.selected.value, ...values } as Student;

      try {
        await studentStore.updateStudent(merged);
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      }
    });

    /**
     * Set the selected student, update the route, and update the form.
     */
    function setSelectedStudent(student: Student|null) {
      if (student !== null) {
        router.replace({
          name: 'StudentsTransactions',
          params: {
            ...route.params,
            studentId: student.id,
          },
        });

        form.setValues(student);
      } else {
        router.replace({
          name: 'Students',
        });

        form.resetForm();
      }

      if (studentStore.selected.value !== student) {
        studentStore.setSelected(student);
      }
    }

    /**
     * Fetch a student by ID number and set it as the selectedStudent.
     */
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
          setSelectedStudent(student);
        }
      } catch (e) {
        console.log(e);
      }
    }

    /**
     * Handle when the user makes a selection in the search widget.
     */
    function handleSelection(student: Student) {
      setSelectedStudent(student);
    }

    /**
     * Handle clearing the student search box.
     */
    function handleClear() {
      setSelectedStudent(null);
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
      }
    });

    // Make params reactive so our links work
    const params = computed(() => route.params);

    return {
      studentStore,
      handleSelection,
      handleClear,
      errors: form.errors,
      handleSubmit,
      params,
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
