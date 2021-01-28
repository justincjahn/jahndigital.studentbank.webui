import { createApp, h } from 'vue';
import router from '@/routers/index';
import Index from './Index.vue';

createApp({
  render() {
    return h(Index);
  },
})
  .use(router)
  .mount('#app');
