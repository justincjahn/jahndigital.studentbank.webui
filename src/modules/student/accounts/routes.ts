import { RouteRecordRaw } from 'vue-router';

// Route Names
import RouteNames from './routeNames';

const routes: RouteRecordRaw[] = [
  {
    path: '/accounts',
    component: () => import(/* webpackChunkName: "student-accounts" */ './AccountsModule.vue'),

    children: [
      {
        path: '',
        name: RouteNames.index,
        component: () => import(/* webpackChunkName: "student-accounts" */ './pages/AccountsIndex.vue'),

        children: [{
          path: 'transactions/:shareId',
          name: RouteNames.transactions,
          component: () => import(/* webpackChunkName: "student-accounts" */ './pages/AccountsTransactions.vue'),
        }],
      },
    ],
  },
];

export default routes;
