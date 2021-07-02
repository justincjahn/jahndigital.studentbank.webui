<template>
  <suspense>
    <div class="student__selector">
      <student-selector
        :model-value="selected"
        :store="globalStore"
        @update:modelValue="setSelectedStudent"
      />
    </div>
  </suspense>

  <div v-if="studentId" class="student__details">
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
      <router-link :to="{name: StudentRouteNames.profile, params}">
        Profile
      </router-link>
    </section>

    <router-view />
  </div>
  <p v-else class="student__hint help-text">
    Please use the search box above to find and select a student.
  </p>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

// Utils
import injectStrict from '@/utils/injectStrict';

// Routes
import StudentRouteNames from '@/modules/admin/students/routeNames';

// Symbols
import { GLOBAL_STORE } from '../symbols';

/**
 * Handles high-level selection of students and routing to sub-routes.
 */
export default defineComponent({
  components: {
    StudentSelector: defineAsyncComponent(() => import(/* webpackChunkName: "admin-students" */ '@/modules/admin/components/StudentSelector.vue')),
  },
  setup() {
    const router = useRouter();
    const globalStore = injectStrict(GLOBAL_STORE);
    const params = computed(() => router.currentRoute.value.params);

    const studentId = computed(() => {
      if (router.currentRoute.value.params.studentId) {
        const id = parseInt(
          Array.isArray(router.currentRoute.value.params.studentId)
            ? router.currentRoute.value.params.studentId[0]
            : router.currentRoute.value.params.studentId,
          10,
        );

        if (Number.isNaN(id)) return undefined;
        return id;
      }

      return undefined;
    });

    function setSelectedStudent(student: Student|null) {
      if (student !== null) {
        router.replace({
          name: StudentRouteNames.transactions,
          params: {
            ...params.value,
            studentId: student.id,
          },
        });
      } else {
        router.replace({
          name: StudentRouteNames.index,
        });
      }

      if (globalStore.student.selected.value !== student) {
        globalStore.student.selected.value = student;
      }
    }

    watch(() => studentId.value, async (newValue, oldValue) => {
      if (newValue === oldValue) return;

      if (!newValue) {
        setSelectedStudent(null);
        return;
      }

      try {
        const student = await globalStore.student.getById(newValue);
        globalStore.student.selected.value = student;
      } catch {
        globalStore.error.setCurrentError('Unable to fetch student!');
      }
    }, { immediate: true });

    watch(() => globalStore.instance.selected.value, (newValue, oldValue) => {
      if (newValue === oldValue) return;
      setSelectedStudent(null);
    });

    return {
      studentId,
      selected: globalStore.student.selected,
      StudentRouteNames,
      globalStore,
      setSelectedStudent,
      selectedInstance: globalStore.instance.selected,
      params,
    };
  },
});
</script>

<style lang="scss">
.student {
  &__selector {
    padding: 2em;
    background-color: colorStep(primary, $step: 2);

    .student-selector {
      max-width: 30em;
    }
  }

  &__hint.help-text {
    margin: 2em;
  }
}
</style>
