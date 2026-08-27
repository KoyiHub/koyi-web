import '@testing-library/jest-dom/vitest';

import { configure } from '@testing-library/dom';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { clearAuthToken } from '@/lib/auth/token-store';
import { server } from '@/mocks/server';

// Routes are lazy chunks that fetch through MSW, so the first render in a file
// can outrun the 1s default while the whole suite compiles in parallel.
configure({ asyncUtilTimeout: 5000 });

// `error` makes an un-mocked request a test failure rather than a silent hang.
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  // Auth tests store real tokens — never let one test's session leak into the next.
  clearAuthToken();
});

afterAll(() => {
  server.close();
});
