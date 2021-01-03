import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import AdminStudentsIndex from '@/views/admin/students/AdminStudentsIndex.vue';
import AdminStudentTransactions from '@/views/admin/students/AdminStudentsTransactions.vue';
import AdminStudentStocks from '@/views/admin/students/AdminStudentsStocks.vue';
import AdminStudentPurchases from '@/views/admin/students/AdminStudentsPurchases.vue';
import AdminLogin from '@/views/admin/AdminLogin.vue';
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
    component: AdminStudentsIndex,
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
    component: () => import('@/views/admin/groups/AdminGroupsIndex.vue'),
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
