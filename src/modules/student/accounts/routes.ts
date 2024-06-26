import { RouteRecordRaw } from 'vue-router';

// Route Names
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/accounts',
    component: () => import(/* webpackChunkName: "student-accounts" */ './AccountsModule.vue'),

    children: [
      {
        path: ':shareId?',
        name: RouteNames.index,
        component: () => import(/* webpackChunkName: "student-accounts" */ './pages/AccountsIndex.vue'),
      },
    ],
  },
];

export default routes;
