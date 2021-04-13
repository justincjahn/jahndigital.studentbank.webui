import { RouteRecordRaw } from 'vue-router';
import StocksModule from './StocksModule.vue';

export enum RouteNames {
  index = 'stocks',
}

const routes: RouteRecordRaw[] = [
  {
    path: '/stocks',
    name: RouteNames.index,
    component: StocksModule,
  },
];

export default routes;
