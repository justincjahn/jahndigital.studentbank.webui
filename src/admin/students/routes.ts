import type { RouteRecordRaw } from 'vue-router';
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/students',
    component: () => import('./StudentsModule.vue'),

    children: [
      {
        path: ':studentId?',
        name: RouteNames.index,
        component: () => import('./pages/StudentsIndex.vue'),
      },
    ],
  },
];

export default routes;
