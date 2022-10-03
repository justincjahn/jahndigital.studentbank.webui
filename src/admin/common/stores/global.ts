import userStore from '@/common/stores/user';
import routerStore from '@/common/stores/router';
import errorStore from '@/common/stores/error';
import { setup as setupInstanceStore } from '@/admin/common/stores/instance';
import { setup as setupGroupStore } from '@/admin/common/stores/group';

export function setup() {
  const instanceStore = setupInstanceStore();
  const groupStore = setupGroupStore(instanceStore);

  function dispose() {
    // Ignore
  }

  return {
    user: userStore,
    router: routerStore,
    error: errorStore,
    instance: instanceStore,
    group: groupStore,
    dispose,
  };
}

export type GlobalStore = ReturnType<typeof setup>;
