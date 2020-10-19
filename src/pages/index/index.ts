import { createApp, h, provide } from 'vue';
import router from '@/routers/index';
import { DefaultApolloClient } from '@vue/apollo-composable';
import { defaultClient } from '@/services/apolloClient';
import Index from './Index.vue';
import store from '../../store';

createApp({
  setup() {
    provide(DefaultApolloClient, defaultClient);
  },

  render() {
    return h(Index);
  },
})
  .use(store)
  .use(router)
  .mount('#app');
