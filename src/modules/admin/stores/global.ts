import userStore from '@/stores/user';
import errorStore from '@/stores/error';
import routerStore from '@/stores/router';
import { setup as defineStockStore } from '@/stores/stock';
import { setup as defineInstanceStore } from './instance';
import { setup as defineGroupStore } from './group';
import { setup as defineStudentStore } from './student';
import { setup as defineShareTypeStore } from './shareType';
import { setup as defineShareStore } from './share';

/**
 * Global store with modules that serves as the overall application state.
 */
export function setup() {
  const instance = defineInstanceStore();
  const group = defineGroupStore(instance);
  const shareType = defineShareTypeStore(instance);
  const shareTypeAvailable = defineShareTypeStore();
  const student = defineStudentStore();
  const share = defineShareStore(student);
  const stock = defineStockStore();
  const stockAvailable = defineStockStore();

  function dispose() {
    stock.dispose();
    stockAvailable.dispose();
  }

  return {
    error: errorStore,
    router: routerStore,
    user: userStore,
    instance,
    group,
    shareType,
    shareTypeAvailable,
    student,
    share,
    stock,
    stockAvailable,
    dispose,
  };
}

export type GlobalStore = ReturnType<typeof setup>;
