import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import routerStore from '@/store/router';

import LoginRoutes from './login/routes';
import AccountsRoutes from './accounts/routes';

import AccountsRoutesNames from './accounts/routeNames';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    redirect: { name: AccountsRoutesNames.index },
  },

  ...LoginRoutes,
  ...AccountsRoutes,
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
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
