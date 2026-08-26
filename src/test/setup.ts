import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { clearAuthToken } from '@/lib/auth/token-store';
import { server } from '@/mocks/server';

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
