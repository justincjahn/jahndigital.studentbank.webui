import { RouteRecordRaw } from 'vue-router';

// Route Names
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/purchases',
    name: RouteNames.index,
    component: () => import(/* webpackChunkName: "admin-purchases" */ './PurchasesModule.vue'),
  },
];

export default routes;
