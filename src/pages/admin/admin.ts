import { createApp, h } from 'vue';
import { AUTH_TOKEN } from '@/constants';
import UserStore from '@/store/modules/user';
import store from '@/store';
import router from '@/routers/admin';
import Admin from './Admin.vue';

createApp({
  setup() {
    const token = localStorage.getItem(AUTH_TOKEN) ?? undefined;

    (async () => {
      await UserStore.setToken(token);
    })();
  },

  render() {
    return h(Admin);
  },
})
  .use(store)
  .use(router)
  .mount('#app');
