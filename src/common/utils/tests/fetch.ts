/* eslint-disable import/no-extraneous-dependencies */
import { vi } from 'vitest';
import fetch, { Headers, Request, Response } from 'node-fetch';

vi.stubGlobal('fetch', fetch);
vi.stubGlobal('Headers', Headers);
vi.stubGlobal('Request', Request);
vi.stubGlobal('Response', Response);
