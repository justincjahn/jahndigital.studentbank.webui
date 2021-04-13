import { createApp, h } from 'vue';
import { AUTH_TOKEN } from '@/constants';
import userStore from '@/store/user';
import router from './routes';
import App from './App.vue';

createApp({
  setup() {
    const token = localStorage.getItem(AUTH_TOKEN);
    userStore.setToken(token);
  },

  render() {
    return h(App);
  },
})
  .use(router)
  .mount('#app');
