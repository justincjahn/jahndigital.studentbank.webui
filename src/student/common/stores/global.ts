import userStore from '@/common/stores/user';
import routerStore from '@/common/stores/router';
import errorStore from '@/common/stores/error';
import { setup as setupShareStore } from '@/student/common/stores/share';

export function setup() {
  const shareStore = setupShareStore(userStore);

  function dispose() {
    shareStore.dispose();
  }

  return {
    user: userStore,
    router: routerStore,
    error: errorStore,
    share: shareStore,
    dispose,
  };
}

export type GlobalStore = ReturnType<typeof setup>;
