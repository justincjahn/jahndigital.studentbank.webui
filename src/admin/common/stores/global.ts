import userStore from '@/common/stores/user';

export function setup() {
  function dispose() {
    // Ignore
  }

  return {
    user: userStore,
    dispose,
  };
}

export type GlobalStore = ReturnType<typeof setup>;
