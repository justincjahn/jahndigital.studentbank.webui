import { createApp, h } from 'vue';
import router from '@/routers/index';
import store from '@/store';
import Index from './Index.vue';

createApp({
  render() {
    return h(Index);
  },
})
  .use(store)
  .use(router)
  .mount('#app');
