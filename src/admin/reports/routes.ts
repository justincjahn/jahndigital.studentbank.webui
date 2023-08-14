import type { RouteRecordRaw } from 'vue-router';
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/reports',
    component: () => import('./ReportsModule.vue'),

    children: [
      {
        path: '',
        name: RouteNames.index,
        component: () => import('./pages/ReportsIndex.vue'),
      },

      {
        path: 'group-statistics',
        name: RouteNames.groupStatistics,
        component: () => import('./pages/ReportsGroupStatistics.vue'),
      },

      {
        path: 'student-statistics',
        name: RouteNames.studentStatistics,
        component: () => import('./pages/ReportsStudentStatistics.vue'),
      },
    ],
  },
];

export default routes;
