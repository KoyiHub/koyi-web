import '@testing-library/jest-dom/vitest';

import { configure } from '@testing-library/dom';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { clearSitting } from '@/lib/api/sitting-store';
import { clearAuthToken } from '@/lib/auth/token-store';
import { resetAssignmentState } from '@/mocks/data/assignment-seed';
import { resetResultsState } from '@/mocks/data/results-seed';
import { resetRunnerState } from '@/mocks/data/runner-seed';
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
  // Same for a child's sitting — a session or a section's state left `in_progress`
  // by one test must not be there when the next test verifies a fresh sitting.
  clearSitting();
  resetRunnerState();
  resetAssignmentState();
  resetResultsState();
});

afterAll(() => {
  server.close();
});
