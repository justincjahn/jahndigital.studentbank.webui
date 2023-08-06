import type { RouteRecordRaw } from 'vue-router';
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/stocks',
    component: () => import('./StocksModule.vue'),

    children: [
      {
        path: '',
        name: RouteNames.index,
        component: () => import('./pages/StocksIndex.vue'),
      },
    ],
  },
];

export default routes;
