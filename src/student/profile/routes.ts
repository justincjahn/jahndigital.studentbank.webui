import type { RouteRecordRaw } from 'vue-router';
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/profile',
    name: RouteNames.index,
    component: () => import('./ProfileModule.vue'),
    redirect: { name: RouteNames.profile },

    children: [
      {
        path: 'me',
        name: RouteNames.profile,
        component: () => import('./pages/ProfileIndex.vue'),
      },
      {
        path: 'change-password',
        name: RouteNames.password,
        component: () => import('./pages/ProfilePassword.vue'),
      },
    ],
  },
];

export default routes;
