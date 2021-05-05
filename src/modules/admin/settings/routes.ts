import { RouteRecordRaw } from 'vue-router';

// Route Names
import RouteNames from './routeNames';

// Components
import SettingsModule from './SettingsModule.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/settings',
    name: RouteNames.index,
    component: SettingsModule,
  },
];

export default routes;
