import { createApp, h } from 'vue';
import { AUTH_TOKEN } from '@/constants';
import userStore from '@/store/user';
import router from '@/routers/admin';
import Admin from './Admin.vue';

createApp({
  setup() {
    const token = localStorage.getItem(AUTH_TOKEN);
    userStore.setToken(token);
  },

  render() {
    return h(Admin);
  },
})
  .use(router)
  .mount('#app');
