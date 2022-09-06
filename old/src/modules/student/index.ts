import { createApp } from 'vue';

// Libraries
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Application
import router from './routes';
import App from './App.vue';

createApp(App)
  .use(router)
  .component('font-awesome-icon', FontAwesomeIcon)
  .mount('#app');
