<template>
  <nav class="navigation">
    <div class="navigation__user-info">
      <template v-if="UserState.isAuthenticated">
        {{UserState.username}}
        (<a href="#" @click="logout">Logout</a>)
      </template>
      <template v-else>
        <router-link to="/admin/login">Login</router-link>
      </template>
    </div>
  </nav>
</template>

<script>
import UserState from '@/store/modules/user';
import AuthenticationService from '@/services/AuthenticationService';
import Apollo from '@/services/Apollo';

const auth = new AuthenticationService(Apollo);

export default {
  setup() {
    const logout = () => auth.logout();

    return {
      UserState,
      logout,
    };
  },
};
</script>

<style lang="scss">
  // .navigation {
  //   display: flex;
  //   justify-content: space-between;
  //   align-items: baseline;
  // }
</style>
