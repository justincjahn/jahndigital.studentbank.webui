<template>
  <AdminNavigation />
  <router-view/>
  <div class="footer">&copy; 2020 Jahn Digital</div>
</template>

<style lang="scss">
@import '@/scss/_layout.scss';
</style>

<script>
import AdminNavigation from '@/components/AdminNavigation.vue';
import UserStore from '@/store/modules/user';
import { useRouter } from 'vue-router';
import { watchEffect } from 'vue';

export default {
  components: {
    AdminNavigation,
  },

  setup() {
    const router = useRouter();

    // Force users to the login page if they aren't authenticated
    watchEffect(async () => {
      if (UserStore.isAuthenticated === false && !UserStore.jwtToken) {
        router.push({ name: 'login' });
      }
    });
  },
};
</script>
