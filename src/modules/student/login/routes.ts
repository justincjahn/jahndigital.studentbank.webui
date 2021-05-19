import { RouteRecordRaw } from 'vue-router';

// Route Names
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import(/* webpackChunkName: "student-login" */ './LoginModule.vue'),

    children: [
      {
        path: '',
        name: RouteNames.index,
        component: () => import(/* webpackChunkName: "student-login" */ './pages/LoginIndex.vue'),
      },
    ],
  },
];

export default routes;
