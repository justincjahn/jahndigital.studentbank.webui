import type { RouteRecordRaw } from 'vue-router';
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/students/:studentId?',
    name: RouteNames.index,
    component: () => import('./StudentsModule.vue'),

    children: [
      {
        path: 'transactions',
        name: RouteNames.transactions,
        component: () => import('./pages/StudentsTransactions.vue'),
      },

      {
        path: 'profile',
        name: RouteNames.profile,
        component: () => import('./pages/StudentsProfile.vue'),
      },
    ],
  },
];

export default routes;
