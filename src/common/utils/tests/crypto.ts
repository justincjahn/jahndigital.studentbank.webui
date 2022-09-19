/* eslint-disable import/no-extraneous-dependencies */
import { vi } from 'vitest';

vi.stubGlobal('crypto', {
  getRandomValues(arr: Array<Uint8Array>) {
    for (let i = 0; i < arr.length; i += 1) {
      // eslint-disable-next-line no-param-reassign
      arr[i] = Math.floor(Math.random() * 254 + 1) as unknown as Uint8Array;
    }

    return arr;
  },
});
