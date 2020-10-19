import { createApp, h, provide } from 'vue';
import { DefaultApolloClient } from '@vue/apollo-composable';
import apolloProvider from '@/services/apolloClient';
import { AUTH_TOKEN } from '@/constants';
import UserStore from '@/store/modules/user';
import store from '../../store';
import Admin from './Admin.vue';
import router from '../../routers/admin';

createApp({
  setup() {
    provide(DefaultApolloClient, apolloProvider);
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
