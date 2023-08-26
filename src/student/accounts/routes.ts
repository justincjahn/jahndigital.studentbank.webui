import type { RouteRecordRaw } from 'vue-router';
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/accounts',
    component: () => import('./AccountsModule.vue'),

    children: [
      {
        path: '',
        name: RouteNames.index,
        component: () => import('./pages/AccountsIndex.vue'),
      },
    ],
  },
];

export default routes;
