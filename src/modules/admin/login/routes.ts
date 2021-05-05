import { RouteRecordRaw } from 'vue-router';

// Route Names
import RouteNames from './routeNames';

// Components
import LoginModule from './LoginModule.vue';
import LoginIndex from './pages/LoginIndex.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: LoginModule,

    children: [
      {
        path: '',
        name: RouteNames.index,
        component: LoginIndex,
      },
    ],
  },
];

export default routes;
