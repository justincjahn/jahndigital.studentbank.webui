import userStore from '@/common/stores/user';
import routerStore from '@/common/stores/router';
import errorStore from '@/common/stores/error';
import { setup as setupInstanceStore } from '@/admin/common/stores/instance';
import { setup as setupGroupStore } from '@/admin/common/stores/group';
import { setup as setupStudentStore } from '@/admin/common/stores/student';
import { setup as setupShareTypeStore } from '@/admin/common/stores/shareType';
import { setup as setupStockStore } from '@/admin/common/stores/stock';
import { setup as setupStockHistoryStore } from '@/admin/common/stores/stockHistory';

export function setup() {
  const instanceStore = setupInstanceStore();
  const groupStore = setupGroupStore(instanceStore);
  const studentStore = setupStudentStore();
  const shareTypeStore = setupShareTypeStore(instanceStore);
  const stockStore = setupStockStore(instanceStore);
  const stockHistoryStore = setupStockHistoryStore(stockStore);

  function dispose() {
    studentStore.dispose();
  }

  return {
    user: userStore,
    router: routerStore,
    error: errorStore,
    instance: instanceStore,
    group: groupStore,
    student: studentStore,
    shareType: shareTypeStore,
    stock: stockStore,
    stockHistory: stockHistoryStore,
    dispose,
  };
}

export type GlobalStore = ReturnType<typeof setup>;
