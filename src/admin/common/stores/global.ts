import userStore from '@/common/stores/user';
import routerStore from '@/common/stores/router';
import errorStore from '@/common/stores/error';
import { setup as setupInstanceStore } from '@/admin/common/stores/instance';
import { setup as setupGroupStore } from '@/admin/common/stores/group';
import { setup as setupStudentStore } from '@/admin/common/stores/student';
import { setup as setupShareTypeStore } from '@/admin/common/stores/shareType';

export function setup() {
  const instanceStore = setupInstanceStore();
  const groupStore = setupGroupStore(instanceStore);
  const studentStore = setupStudentStore();
  const shareTypeStore = setupShareTypeStore(instanceStore);

  function dispose() {
    // Ignore
  }

  return {
    user: userStore,
    router: routerStore,
    error: errorStore,
    instance: instanceStore,
    group: groupStore,
    student: studentStore,
    shareType: shareTypeStore,
    dispose,
  };
}

export type GlobalStore = ReturnType<typeof setup>;
