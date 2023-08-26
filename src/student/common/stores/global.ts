import userStore from '@/common/stores/user';
import routerStore from '@/common/stores/router';
import errorStore from '@/common/stores/error';

export function setup() {
  function dispose() {}

  return {
    user: userStore,
    router: routerStore,
    error: errorStore,
    dispose,
  };
}

export type GlobalStore = ReturnType<typeof setup>;
