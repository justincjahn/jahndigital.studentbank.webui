import { RouteRecordRaw } from 'vue-router';

// Route Names
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/profile',
    component: () => import(/* webpackChunkName: "admin-login" */ './ProfileModule.vue'),

    children: [
      {
        path: '',
        name: RouteNames.index,
        component: () => import(/* webpackChunkName: "admin-login" */ './pages/ProfileIndex.vue'),
      },
    ],
  },
];

export default routes;
