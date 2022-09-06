import { RouteRecordRaw } from 'vue-router';

// Route Names
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/groups',
    component: () => import(/* webpackChunkName: "admin-groups" */ './GroupsModule.vue'),

    children: [
      {
        path: '',
        name: RouteNames.index,
        component: () => import(/* webpackChunkName: "admin-groups" */ './pages/GroupsIndex.vue'),
      },
    ],
  },
];

export default routes;
