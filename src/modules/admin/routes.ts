import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import GroupRoutes, { RouteNames as GroupRouteNames } from '@/modules/admin/groups/routes';
import StudentRoutes from '@/modules/admin/students/routes';
import PurchasesRoutes from '@/modules/admin/purchases/routes';
import StocksRoutes from '@/modules/admin/stocks/routes';
import SettingsRoutes from '@/modules/admin/settings/routes';
import LoginRoutes from '@/modules/admin/login/routes';
import routerStore from '@/store/router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    redirect: { name: GroupRouteNames.index },
  },

  ...GroupRoutes,
  ...StudentRoutes,
  ...PurchasesRoutes,
  ...StocksRoutes,
  ...SettingsRoutes,
  ...LoginRoutes,
];

const router = createRouter({
  history: createWebHistory(`${process.env.BASE_URL}admin`),
  routes,
});

// If the route is a function, then tell the store we need to load
router.beforeEach((to, _, next) => {
  if (typeof to.matched[0]?.components.default === 'function') {
    routerStore.setLoading(true);
  }

  next();
});

// After the route component has loaded, tell the store we're done loading
// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.beforeResolve((_, __, next) => {
  routerStore.setLoading(false);
  next();
});

export default router;
