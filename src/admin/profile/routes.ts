import type { RouteRecordRaw } from 'vue-router';
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/profile',
    component: () => import('./ProfileModule.vue'),

    children: [
      {
        path: '',
        name: RouteNames.index,
        component: () => import('./pages/ProfileIndex.vue'),
      },
    ],
  },
];

export default routes;
