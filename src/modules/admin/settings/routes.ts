import { RouteRecordRaw } from 'vue-router';
import SettingsModule from './SettingsModule.vue';

export enum RouteNames {
  index = 'settings',
}

const routes: RouteRecordRaw[] = [
  {
    path: '/settings',
    name: RouteNames.index,
    component: SettingsModule,
  },
];

export default routes;
