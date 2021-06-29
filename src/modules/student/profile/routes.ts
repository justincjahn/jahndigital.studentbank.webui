import { RouteRecordRaw } from 'vue-router';

// Route Names
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/profile',
    component: () => import(/* webpackChunkName: "student-login" */ './ProfileModule.vue'),

    children: [
      {
        path: '',
        name: RouteNames.index,
        component: () => import(/* webpackChunkName: "student-login" */ './pages/ProfileIndex.vue'),
      },
    ],
  },
];

export default routes;
