<script setup lang="ts">
// Core
import { defineAsyncComponent, computed, watch, onUnmounted } from 'vue';

// Utils
import injectStrict from '@/common/utils/injectStrict';

// Symbols
import { GLOBAL_STORE } from '@/admin/symbols';
import { useRouter } from 'vue-router';

// Components
import LoadingPage from '@/common/pages/LoadingPage.vue';

// Routes
import RouteNames from './routeNames';

const StudentSelector = defineAsyncComponent(
  () => import('@/admin/students/components/StudentSelector')
);

const globalStore = injectStrict(GLOBAL_STORE);
const isLoading = computed(() => globalStore.student.loading.value);

const selectedStudent = computed({
  get() {
    return globalStore.student.selected.value;
  },

  set(value) {
    globalStore.student.selected.value = value;
  },
});

const router = useRouter();

const routerStudentId = computed(() => {
  const route = router.currentRoute.value;
  const rawStudentId = route.params.studentId ?? '-1';

  const studentId = Number.parseInt(
    Array.isArray(rawStudentId) ? rawStudentId[0] : rawStudentId,
    10
  );

  return studentId;
});

watch(
  () => selectedStudent.value,

  (newValue) => {
    const routeName =
      router.currentRoute.value.name?.toString() ?? RouteNames.index;

    // If a student is selected but we're still in the index, route to transaction
    /// otherwise, just update the studentId in the URL
    router.replace({
      name:
        routeName === RouteNames.index ? RouteNames.transactions : routeName,
      params: {
        studentId: newValue?.id ?? null,
      },
    });
  }
);

watch(
  () => routerStudentId.value,

  async (studentId) => {
    if (studentId < 0) return;

    if (studentId !== selectedStudent.value?.id) {
      try {
        await globalStore.student.selectById(studentId);
      } catch (e) {
        if (e instanceof Error) {
          globalStore.error.setCurrentError(e?.message ?? e);
        }
      }
    }
  },

  {
    immediate: true,
  }
);

// If the user navigates to the index while still on the page, clear the student
const routerAfter = router.afterEach(() => {
  if (router.currentRoute.value.name === RouteNames.index) {
    selectedStudent.value = null;
  }
});

// When the user leaves the module, clear the student
onUnmounted(() => {
  selectedStudent.value = null;
  routerAfter();
});
</script>

<template>
  <div class="sub-menu">
    <div class="container">
      <suspense>
        <student-selector v-model="selectedStudent" :store="globalStore" />
      </suspense>
    </div>
  </div>

  <loading-page v-if="isLoading" />

  <div v-else-if="selectedStudent === null" class="container section">
    <p class="help-text">
      No student is selected. Please search for a student using the control
      above to begin...
    </p>
  </div>

  <template v-else>
    <div class="sub-nav | section">
      <nav class="container flex-group" data-flex-type="start">
        <router-link
          :to="{
            name: RouteNames.transactions,
            params: { studentId: selectedStudent.id },
          }"
        >
          Transactions
        </router-link>

        <router-link
          :to="{
            name: RouteNames.profile,
            params: { studentId: selectedStudent.id },
          }"
        >
          Profile
        </router-link>
      </nav>
    </div>

    <section class="main-content | container">
      <h2 class="size-xl">
        {{ selectedStudent.lastName }}, {{ selectedStudent.firstName }}
      </h2>

      <router-view />
    </section>
  </template>
</template>
