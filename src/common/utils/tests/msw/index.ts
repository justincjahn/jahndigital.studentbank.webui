/* eslint-disable import/no-extraneous-dependencies */
import { afterAll, afterEach, beforeAll } from 'vitest';

// Mocks
import '@/common/utils/tests/fetch';

// MSW
import { setupServer } from 'msw/node';

// Handlers
import userHandlers from './user';

const server = setupServer(...userHandlers);

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

export * from './user';
export { server };
