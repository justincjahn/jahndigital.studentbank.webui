/* eslint-disable import/no-extraneous-dependencies */
import { vi } from 'vitest';
import fetch, { Headers, Request, Response } from 'node-fetch';

// eslint-disable-next-line no-restricted-globals
if (typeof location === 'undefined') {
  vi.stubGlobal('location', {
    origin: 'https://localhost:8443',
  });
}

vi.stubGlobal('fetch', fetch);
vi.stubGlobal('Headers', Headers);
vi.stubGlobal('Request', Request);
vi.stubGlobal('Response', Response);
