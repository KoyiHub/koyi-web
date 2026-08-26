/* eslint-disable react-refresh/only-export-components */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { routes } from '@/app/routes';
import { setAuthTokens } from '@/lib/auth/token-store';

/** Retries and caching make tests slow and flaky — turn both off. */
function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>;
}

/** Render a single component with app-wide context but no router. */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Providers, ...options }),
  };
}

/**
 * Mount the real route table at a given URL — the way to test navigation,
 * route params and layouts without stubbing the router.
 *
 * Seeds an authenticated session by default so existing teacher-route tests
 * don't need to know about the auth guard; pass `authenticated: false` for
 * the tests that specifically exercise the unauthenticated redirect.
 */
export function renderRoute(initialPath = '/', options?: { authenticated?: boolean }) {
  if (options?.authenticated ?? true) {
    setAuthTokens({ access: 'test-access-token', refresh: 'test-refresh-token' });
  }

  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });

  return {
    user: userEvent.setup(),
    router,
    ...render(
      <Providers>
        <RouterProvider router={router} />
      </Providers>,
    ),
  };
}

export * from '@testing-library/react';
export { userEvent };
