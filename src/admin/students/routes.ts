import type { RouteRecordRaw } from 'vue-router';
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/students',
    component: () => import('./StudentsModule.vue'),

    children: [
      {
        path: ':studentId?',
        component: () => import('./pages/StudentsIndex.vue'),

        children: [
          {
            path: 'transactions',
            name: RouteNames.index,
            component: () => import('./pages/StudentsTransactions.vue'),
          },

          {
            path: 'security',
            name: RouteNames.security,
            component: () => import('./pages/StudentsSecurity.vue'),
          },
        ],
      },
    ],
  },
];

export default routes;
