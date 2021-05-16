import { RouteRecordRaw } from 'vue-router';
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/stocks',
    component: () => import(/* webpackChunkName: "admin-stocks" */ './StocksModule.vue'),

    children: [
      {
        path: '',
        name: RouteNames.index,
        component: () => import(/* webpackChunkName: "admin-stocks" */ './pages/StocksIndex.vue'),
      },

      {
        path: ':id',
        name: RouteNames.stockDetails,
        component: () => import(/* webpackChunkName: "admin-stocks" */ './pages/StocksDetails.vue'),
      },
    ],
  },
];

export default routes;
