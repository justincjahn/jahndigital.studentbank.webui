import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

// Stores
import routerStore from '@/common/stores/router';

// Routing
import GroupRouteNames from '@/admin/groups/routeNames';
import GroupRoutes from '@/admin/groups/routes';
import StudentRoutes from '@/admin/students/routes';
import StockRoutes from '@/admin/stocks/routes';
import ProfileRoutes from '@/admin/profile/routes';
import ReportRoutes from '@/admin/reports/routes';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'index',
    redirect: { name: GroupRouteNames.index },
  },

  ...GroupRoutes,
  ...StudentRoutes,
  ...StockRoutes,
  ...ProfileRoutes,
  ...ReportRoutes,
];

const router = createRouter({
  history: createWebHistory(`${import.meta.env.BASE_URL}admin`),
  routes,
});

// If the route is a function, then tell the store we need to load
router.beforeEach((to, _, next) => {
  if (typeof to.matched[0]?.components?.default === 'function') {
    routerStore.loading.value = true;
  }

  next();
});

// After the route component has loaded, tell the store we're done loading
router.beforeResolve((_, __, next) => {
  routerStore.loading.value = false;
  next();
});

export default router;