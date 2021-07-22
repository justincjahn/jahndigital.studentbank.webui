import { RouteRecordRaw } from 'vue-router';

// Route Names
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/stocks',
    name: RouteNames.index,
    component: () => import(/* webpackChunkName: "student-stocks" */ './StocksModule.vue'),
    redirect: { name: RouteNames.holdings },

    children: [
      {
        path: 'portfolio',
        name: RouteNames.holdings,
        component: () => import(/* webpackChunkName: "student-stocks" */ './pages/StocksIndex.vue'),
      },

      {
        path: 'available',
        name: RouteNames.available,
        component: () => import(/* webpackChunkName: "student-stocks" */ './pages/StocksAvailable.vue'),
      },
    ],
  },
];

export default routes;
