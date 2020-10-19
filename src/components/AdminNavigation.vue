<template>
  <div class="navigation navigation--admin">
    <h1>Student Bank Admin</h1>
    <div class="navigation__user-info">
      <template v-if="UserState.isAuthenticated">
        {{UserState.username}}
        (<a href="#" @click="logout">Logout</a>)
      </template>
      <template v-else>
        <router-link to="/admin/login">Login</router-link>
      </template>
    </div>
  </div>
</template>

<script>
import UserState from '@/store/modules/user';
import AuthenticationService from '@/services/authentication.service';
import { defaultClient } from '@/services/apolloClient';

const auth = new AuthenticationService(defaultClient);

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
  .navigation {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
</style>
