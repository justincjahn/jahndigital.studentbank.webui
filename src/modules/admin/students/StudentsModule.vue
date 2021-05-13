<template>
  <suspense>
    <student-selector
      class="student-selector--fixed-width"
      :model-value="selected"
      @update:modelValue="handleSelection"
    />
  </suspense>

  <div class="student-info">
    <form autocomplete="off" @submit.prevent="handleSubmit">
      <div class="student-info--form-group">
        <label for="student-info__account-number">Account Number</label>
        <Field
          id="student-info__account-number"
          name="accountNumber"
          type="text"
        />
        <p v-if="errors.accountNumber" class="error">
          {{ errors.accountNumber }}
        </p>
      </div>
      <div class="student-info--form-group">
        <label for="student-info__email">Email</label>
        <Field
          id="student-info__email"
          name="email"
          type="text"
        />
        <p v-if="errors.email" class="error">
          {{ errors.email }}
        </p>
      </div>
      <div class="student-info--form-group">
        <label for="student-info__first-name">First Name</label>
        <Field
          id="student-info__first-name"
          name="firstName"
          type="text"
        />
        <p v-if="errors.firstName" class="error">
          {{ errors.firstName }}
        </p>
      </div>
      <div class="student-info--form-group">
        <label for="student-info__last-name">Last Name</label>
        <Field
          id="student-info__last-name"
          name="lastName"
          type="text"
        />
        <p v-if="errors.lastName" class="error">
          {{ errors.lastName }}
        </p>
      </div>
      <div class="student-info--submit-group">
        <input type="submit" class="primary" value="Update" />
      </div>
    </form>
  </div>

  <section class="sub-nav sub-nav--padded">
    <router-link :to="{name: StudentRouteNames.transactions, params}">
      Transactions
    </router-link>
    <router-link :to="{name: StudentRouteNames.stocks, params}">
      Stocks
    </router-link>
    <router-link :to="{name: StudentRouteNames.purchases, params}">
      Purchases
    </router-link>
  </section>

  <div class="student-details">
    <router-view v-if="studentStore.selected.value !== null" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed, defineAsyncComponent, provide } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Field, useForm } from 'vee-validate';

// Utils
import injectStrict from '@/utils/injectStrict';
import { validateAccountUnique, validateEmail, validateName } from '@/utils/validators';

// Routes
// eslint-disable-next-line import/no-cycle
import StudentRouteNames from '@/modules/admin/students/routeNames';

// Stores
import errorStore from '@/store/error';
import { setup as defineStudentStore } from '../stores/student';

// Symbols
// eslint-disable-next-line import/order
import { INSTANCE_STORE_SYMBOL } from '@/modules/admin/symbols';
import { STUDENT_STORE_SYMBOL } from './symbols';

/**
 * Handles high-level selection of students and routing to sub-routes.
 */
export default defineComponent({
  components: {
    StudentSelector: defineAsyncComponent(() => import(/* webpackChunkName: "admin-students" */ '@/modules/admin/components/StudentSelector.vue')),
    Field,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const instanceStore = injectStrict(INSTANCE_STORE_SYMBOL);

    const studentStore = defineStudentStore();
    provide(STUDENT_STORE_SYMBOL, studentStore);

    const validateAccount = validateAccountUnique({ studentStore });

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
          name: StudentRouteNames.transactions,
          params: {
            ...route.params,
            studentId: student.id,
          },
        });

        form.setValues(student);
      } else {
        router.replace({
          name: StudentRouteNames.index,
        });

        form.resetForm();
      }

      if (studentStore.selected.value !== student) {
        studentStore.setSelected(student);
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

        if (!Number.isNaN(studentId)) {
          studentStore
            .getById(studentId)
            .then((student) => {
              studentStore.setSelected(student);
            })
            .catch((error) => {
              errorStore.setCurrentError(error?.message ?? error);
            });
        }
      }
    });

    // Make params reactive so our links work
    const params = computed(() => route.params);

    return {
      selected: studentStore.selected,
      StudentRouteNames,
      studentStore,
      handleSelection,
      handleClear,
      errors: form.errors,
      handleSubmit,
      selectedInstance: instanceStore.selected,
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

  div.student-selector--fixed-width {
    width: clamp(25rem, 35vw, 35rem);
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
