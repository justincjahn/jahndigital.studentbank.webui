import { RouteRecordRaw } from 'vue-router';

// Route Names
import RouteNames from './routeNames';

// Components
import PurchasesModule from './PurchasesModule.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/purchases',
    name: RouteNames.index,
    component: PurchasesModule,
  },
];

export default routes;
