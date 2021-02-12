import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import routerStore from '@/store/router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/admin',
    name: 'Home',
    redirect: { name: 'Students' },
  },

  {
    path: '/admin/students/:studentId?',
    name: 'Students',
    component: () => import(/* webpackChunkName: "admin-students" */ '@/views/admin/students/AdminStudentsIndex.vue'),
    children: [
      {
        path: 'transactions',
        name: 'StudentsTransactions',
        component: () => import(/* webpackChunkName: "admin-students" */ '@/views/admin/students/AdminStudentsTransactions.vue'),
      },

      {
        path: 'stocks',
        name: 'StudentsStocks',
        component: () => import(/* webpackChunkName: "admin-students" */ '@/views/admin/students/AdminStudentsStocks.vue'),
      },

      {
        path: 'purchases',
        name: 'StudentsPurchases',
        component: () => import(/* webpackChunkName: "admin-students" */ '@/views/admin/students/AdminStudentsPurchases.vue'),
      },
    ],
  },

  {
    path: '/admin/groups/:groupId?',
    name: 'Groups',
    component: () => import(/* webpackChunkName: "admin-groups" */ '@/views/admin/groups/AdminGroupsIndex.vue'),
  },

  {
    path: '/admin/stocks',
    name: 'Stocks',
    component: () => import(/* webpackChunkName: "about" */ '@/views/About.vue'),
  },

  {
    path: '/admin/purchases',
    name: 'Purchases',
    component: () => import(/* webpackChunkName: "about" */ '@/views/About.vue'),
  },

  {
    path: '/admin/settings',
    name: 'Settings',
    component: () => import(/* webpackChunkName: "about" */ '@/views/About.vue'),
  },

  {
    path: '/admin/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "admin-main" */ '@/views/admin/AdminLogin.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, _, next) => {
  if (typeof to.matched[0]?.components.default === 'function') {
    routerStore.setLoading(true);
  }

  next();
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.beforeResolve((_, __, next) => {
  routerStore.setLoading(false);
  next();
});

export default router;
