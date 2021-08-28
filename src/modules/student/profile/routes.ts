import { RouteRecordRaw } from 'vue-router';

// Route Names
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/profile',
    name: RouteNames.index,
    component: () => import(/* webpackChunkName: "student-login" */ './ProfileModule.vue'),
    redirect: { name: RouteNames.myProfile },

    children: [
      {
        path: 'me',
        name: RouteNames.myProfile,
        component: () => import(/* webpackChunkName: "student-login" */ './pages/ProfileIndex.vue'),
      },
      {
        path: 'password',
        name: RouteNames.changePassword,
        component: () => import(/* webpackChunkName: "student-login" */ './pages/ProfilePassword.vue'),
      },
    ],
  },
];

export default routes;
