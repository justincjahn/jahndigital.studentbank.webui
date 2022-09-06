import { createApp, h } from 'vue';
import router from './routes';
import App from './App.vue';

createApp({
  render() {
    return h(App);
  },
})
  .use(router)
  .mount('#app');
