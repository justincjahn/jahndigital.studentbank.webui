import { RouteRecordRaw } from 'vue-router';
import LoginModule from './LoginModule.vue';
import LoginIndex from './pages/LoginIndex.vue';

export enum RouteNames {
  index = 'login',
}

const routes: RouteRecordRaw[] = [
  {
    path: RouteNames.index,
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
