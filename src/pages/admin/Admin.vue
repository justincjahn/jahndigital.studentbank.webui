<template>
  <AdminNavigation />
  <router-view/>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
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
