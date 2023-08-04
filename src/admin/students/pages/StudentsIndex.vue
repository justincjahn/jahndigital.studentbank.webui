<script setup lang="ts">
// Core
import { defineAsyncComponent, computed, watch } from 'vue';

// Utils
import injectStrict from '@/common/utils/injectStrict';

// Symbols
import { GLOBAL_STORE } from '@/admin/symbols';
import { useRouter } from 'vue-router';

// Components
import LoadingPage from '@/common/components/LoadingPage.vue';

// Routes
import RouteNames from '../routeNames';

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
    router.push({
      name: RouteNames.transactions,
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
</script>

<template>
  <div class="sub-menu">
    <suspense>
      <student-selector v-model="selectedStudent" :store="globalStore" />
    </suspense>
  </div>

  <loading-page v-if="isLoading" class="loading-page" />

  <section v-else-if="selectedStudent === null">
    <p class="help-text">
      Please search for a student using the box above to begin...
    </p>
  </section>

  <section v-else-if="selectedStudent !== null">
    <nav class="sub-nav">
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
          name: RouteNames.security,
          params: { studentId: selectedStudent.id },
        }"
      >
        Security
      </router-link>
    </nav>

    <h1>{{ selectedStudent.lastName }}, {{ selectedStudent.firstName }}</h1>

    <router-view />
  </section>
</template>

<style scoped>
.sub-menu {
  padding-left: 1em;
}

.loading-page {
  margin-top: 2rem;
}

h1 {
  margin-inline: 0.5em;
  margin-top: 1em;
}
</style>
