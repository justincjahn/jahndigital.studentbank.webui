import userStore from '@/common/stores/user';
import routerStore from '@/common/stores/router';
import errorStore from '@/common/stores/error';
import { setup as setupInstanceStore } from '@/admin/common/stores/instance';

export function setup() {
  const instanceStore = setupInstanceStore();

  function dispose() {
    // Ignore
  }

  return {
    user: userStore,
    router: routerStore,
    error: errorStore,
    instance: instanceStore,
    dispose,
  };
}

export type GlobalStore = ReturnType<typeof setup>;
