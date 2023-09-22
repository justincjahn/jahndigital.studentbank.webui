import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

// Stores
import routerStore from '@/common/stores/router';

// Routes
import AccountRouteNames from '@/student/accounts/routeNames';
import AccountRoutes from '@/student/accounts/routes';
import StockRoutes from '@/student/stocks/routes';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'index',
    redirect: { name: AccountRouteNames.index },
  },

  ...AccountRoutes,
  ...StockRoutes,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// If the route is a function, then tell the store we need to load
router.beforeEach((to, _, next) => {
  if (to.matched.length > 0) {
    const component = to.matched[to.matched.length - 1].components?.default;

    if (typeof component === 'function') {
      routerStore.loading.value = true;
    }
  }

  next();
});

// After the route component has loaded, tell the store we're done loading
router.beforeResolve((_, __, next) => {
  routerStore.loading.value = false;
  next();
});

export default router;
