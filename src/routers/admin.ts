import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import AdminStudents from '@/views/AdminStudents.vue';
import AdminStudentTransactions from '@/views/AdminStudents/Transactions.vue';
import AdminStudentStocks from '@/views/AdminStudents/Stocks.vue';
import AdminStudentPurchases from '@/views/AdminStudents/Purchases.vue';
import AdminGroups from '@/views/AdminGroups.vue';
import AdminLogin from '@/views/AdminLogin.vue';
import About from '@/views/About.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/admin',
    name: 'Home',
    redirect: { name: 'Students' },
  },

  {
    path: '/admin/students/:studentId?',
    name: 'Students',
    component: AdminStudents,
    children: [
      {
        path: 'transactions',
        name: 'StudentsTransactions',
        component: AdminStudentTransactions,
      },

      {
        path: 'stocks',
        name: 'StudentsStocks',
        component: AdminStudentStocks,
      },

      {
        path: 'purchases',
        name: 'StudentsPurchases',
        component: AdminStudentPurchases,
      },
    ],
  },

  {
    path: '/admin/groups/:groupId?',
    name: 'Groups',
    component: AdminGroups,
  },

  {
    path: '/admin/stocks',
    name: 'Stocks',
    component: About,
  },

  {
    path: '/admin/purchases',
    name: 'Purchases',
    component: About,
  },

  {
    path: '/admin/settings',
    name: 'Settings',
    component: About,
  },

  {
    path: '/admin/login',
    name: 'login',
    component: AdminLogin,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
