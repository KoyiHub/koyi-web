import type { RouteObject } from 'react-router';

import { RootErrorBoundary } from '@/app/root-error-boundary';
import { RootLayout } from '@/app/root-layout';

/**
 * Central route table. Every page is code-split via `lazy` so the initial
 * bundle carries only the shell; adding a route never grows the entry chunk.
 *
 * Route paths live in `@/config/paths` — never hand-write a URL string in a
 * component, so renames stay a one-file change.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: RootErrorBoundary,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('@/features/home/home-page')).HomePage }),
      },
      {
        path: 'users',
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('@/features/users/routes/users-page')).UsersPage,
            }),
          },
          {
            path: ':userId',
            lazy: async () => ({
              Component: (await import('@/features/users/routes/user-detail-page')).UserDetailPage,
            }),
          },
        ],
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/app/not-found')).NotFound }),
      },
    ],
  },
];
