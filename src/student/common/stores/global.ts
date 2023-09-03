import userStore from '@/common/stores/user';
import routerStore from '@/common/stores/router';
import errorStore from '@/common/stores/error';
import { setup as setupShareStore } from '@/student/common/stores/share';
import { setup as setupStockStore } from '@/student/common/stores/stock';
import { setup as setupStudentStockStore } from '@/student/common/stores/studentStock';

export function setup() {
  const shareStore = setupShareStore(userStore);
  const stockStore = setupStockStore();
  const studentStockStore = setupStudentStockStore();

  function dispose() {
    shareStore.dispose();
    stockStore.dispose();
    studentStockStore.dispose();
  }

  return {
    user: userStore,
    router: routerStore,
    error: errorStore,
    share: shareStore,
    stock: stockStore,
    studentStock: studentStockStore,
    dispose,
  };
}

export type GlobalStore = ReturnType<typeof setup>;
