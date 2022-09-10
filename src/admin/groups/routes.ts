import { RouteRecordRaw } from 'vue-router';
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/groups',
    component: () => import('./GroupsModule.vue'),

    children: [
      {
        path: '',
        name: RouteNames.index,
        component: () => import('./pages/GroupsIndex.vue'),
      },
    ],
  },
];

export default routes;
