import type { RouteRecordRaw } from 'vue-router';
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/stocks',
    name: RouteNames.index,
    component: () => import('./StocksModule.vue'),
    children: [],
  },
];

export default routes;
