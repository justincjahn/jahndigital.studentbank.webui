import { RouteRecordRaw } from 'vue-router';

// Route Names
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/settings',
    name: RouteNames.index,
    component: () => import(/* webpackChunkName: "admin-settings" */ './SettingsModule.vue'),
  },
];

export default routes;
