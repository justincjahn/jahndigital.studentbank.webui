/* eslint-disable import/no-extraneous-dependencies */
import { vi, beforeEach } from 'vitest';

let localStore: Record<string, any> = {};

const localStorage = {
  getItem: vi.fn((key: string) => (key in localStore ? localStore[key] : null)),

  setItem: vi.fn((key: string, value: string) => {
    localStore[key] = `${value}`;
  }),

  removeItem: vi.fn((key: string) => {
    if (!(key in localStore)) return;
    delete localStore[key];
  }),

  clear: vi.fn(() => {
    localStore = {};
  }),
};

vi.stubGlobal('localStorage', localStorage);

beforeEach(() => {
  localStorage.clear();
});
