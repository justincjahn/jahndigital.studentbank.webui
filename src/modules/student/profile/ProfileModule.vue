<template>
  <section class="sub-nav sub-nav--padded">
    <router-link :to="{ name: myRoute }">
      My Profile
    </router-link>

    <router-link :to="{ name: passwordRoute }">
      Change Password
    </router-link>
  </section>
  <router-view v-if="!loading" />
  <template v-else>
    <loading-label class="page-loading" />
  </template>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';

// Services
import { info } from '@/services/auth';

// Components
import LoadingLabel from '@/components/LoadingLabel.vue';

// Stores
import errorStore from '@/stores/error';

// Routes
import routeNames from './routeNames';

export default defineComponent({
  components: {
    LoadingLabel,
  },
  setup() {
    const loading = ref(true);

    onMounted(async () => {
      try {
        loading.value = true;
        await info();
      } catch (e) {
        if (e instanceof Error) {
          errorStore.setCurrentError(e?.message ?? e);
        }
      } finally {
        loading.value = false;
      }
    });

    return {
      loading,
      myRoute: routeNames.myProfile,
      passwordRoute: routeNames.changePassword,
    };
  },
});
</script>
