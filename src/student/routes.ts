import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

// Stores
import routerStore from '@/common/stores/router';

// Routes
import AccountRouteNames from '@/student/accounts/routeNames';
import AccountRoutes from '@/student/accounts/routes';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'index',
    redirect: { name: AccountRouteNames.index },
  },

  ...AccountRoutes,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
