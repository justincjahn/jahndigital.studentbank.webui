import type { RouteRecordRaw } from 'vue-router';
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/stocks',
    name: RouteNames.index,
    component: () => import('./StocksModule.vue'),
    redirect: { name: RouteNames.available },

    children: [
      {
        path: 'available',
        name: RouteNames.available,
        component: () => import('./pages/StocksAvailable.vue'),
      },

      {
        path: 'portfolio',
        name: RouteNames.portfolio,
        component: () => import('./pages/StocksPortfolio.vue'),
      },

      {
        path: 'details/:id',
        name: RouteNames.details,
        component: () => import('./pages/StocksDetail.vue'),
      },
    ],
  },
];

export default routes;
