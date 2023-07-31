<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue';

// Types
import type { Student } from '@/common/services/student';

// Utils
import injectStrict from '@/common/utils/injectStrict';

// Symbols
import { GLOBAL_STORE } from '@/admin/symbols';

const globalStore = injectStrict(GLOBAL_STORE);

const StudentSelector = defineAsyncComponent(
  () => import('@/admin/students/components/StudentSelector')
);

const selectedStudent = ref<Student | null>(null);
</script>

<template>
  <suspense>
    <student-selector v-model="selectedStudent" :store="globalStore" />
  </suspense>
</template>
