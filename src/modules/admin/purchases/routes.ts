import { RouteRecordRaw } from 'vue-router';
import PurchasesModule from './PurchasesModule.vue';

export enum RouteNames {
  index = 'purchases',
}

const routes: RouteRecordRaw[] = [
  {
    path: 'purchases',
    name: RouteNames.index,
    component: PurchasesModule,
  },
];

export default routes;
