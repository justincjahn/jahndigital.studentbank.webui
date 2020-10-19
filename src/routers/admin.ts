import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import AdminHome from '@/views/AdminHome.vue';
import AdminLogin from '@/views/AdminLogin.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/admin/',
    name: 'Home',
    component: AdminHome,
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
