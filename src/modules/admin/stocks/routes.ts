import { RouteRecordRaw } from 'vue-router';
import StocksModule from './StocksModule.vue';
import StocksIndex from './pages/StocksIndex.vue';
import StocksDetails from './pages/StocksDetails.vue';
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/stocks',
    component: StocksModule,

    children: [
      {
        path: '',
        name: RouteNames.index,
        component: StocksIndex,
      },

      {
        path: ':id',
        name: RouteNames.stockDetails,
        component: StocksDetails,
      },
    ],
  },
];

export default routes;
