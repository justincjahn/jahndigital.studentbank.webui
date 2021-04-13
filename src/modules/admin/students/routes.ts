import { RouteRecordRaw } from 'vue-router';

export enum RouteNames {
  index = 'students',
  transactions = 'students-transactions',
  stocks = 'students-stocks',
  purchases = 'students-purchases',
}

const routes: RouteRecordRaw[] = [
  {
    path: '/students/:studentId?',
    name: RouteNames.index,
    component: () => import(/* webpackChunkName: "admin-students" */ '@/modules/admin/students/pages/StudentsIndex.vue'),
    children: [
      {
        path: 'transactions',
        name: RouteNames.transactions,
        component: () => import(/* webpackChunkName: "admin-students" */ '@/modules/admin/students/pages/StudentsTransactions.vue'),
      },

      {
        path: 'stocks',
        name: RouteNames.stocks,
        component: () => import(/* webpackChunkName: "admin-students" */ '@/modules/admin/students/pages/StudentsStocks.vue'),
      },

      {
        path: 'purchases',
        name: RouteNames.purchases,
        component: () => import(/* webpackChunkName: "admin-students" */ '@/modules/admin/students/pages/StudentsPurchases.vue'),
      },
    ],
  },
];

export default routes;
