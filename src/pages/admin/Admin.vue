<template>
  <AdminNavigation />
  <router-view/>
  <div class="footer">&copy; 2020 Jahn Digital</div>

  <Modal
    :show="GlobalState.currentError !== null"
    customClass="destructive"
    title="Error"
    @ok="GlobalState.setCurrentError(null)"
  >
    {{GlobalState.currentError}}
  </Modal>
</template>

<style lang="scss">
@import '@/scss/_layout.scss';
</style>

<script>
import AdminNavigation from '@/components/AdminNavigation.vue';
import Modal from '@/components/Modal.vue';
import UserStore from '@/store/modules/user';
import GlobalState from '@/store/modules/global';
import { useRouter } from 'vue-router';
import { watchEffect } from 'vue';

export default {
  components: {
    AdminNavigation,
    Modal,
  },

  setup() {
    const router = useRouter();

    // Force users to the login page if they aren't authenticated
    watchEffect(() => {
      if (UserStore.isAuthenticated === false && !UserStore.jwtToken) {
        router.push({ name: 'login' });
      }
    });

    return {
      GlobalState,
    };
  },
};
</script>
