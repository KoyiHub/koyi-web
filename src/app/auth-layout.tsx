import { Suspense } from 'react';
import { Outlet } from 'react-router';

import { PageSpinner } from '@/components/ui/page-spinner';

/**
 * Public shell for /login and /signup: light background, a shared header
 * with the wordmark and non-interactive role context, then a single
 * centered card wrapping the routed form. "School Admin" is shown only as
 * context — Koyi web is teacher-only, so it isn't a real, clickable tab.
 */
export function AuthLayout() {
  return (
    <div className="bg-koyi-surface flex min-h-dvh flex-col">
      <header className="border-koyi-border bg-koyi-card border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="text-koyi-primary text-lg font-semibold tracking-tight">Koyi</span>

          <div className="text-koyi-muted flex items-center gap-4 text-sm font-medium">
            <span aria-disabled="true" className="cursor-not-allowed opacity-60">
              School Admin
            </span>
            <span className="text-koyi-border" aria-hidden="true">
              |
            </span>
            <span className="text-koyi-primary">School Teacher</span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="rounded-koyi-lg border-koyi-border bg-koyi-card w-full max-w-sm border p-8 shadow-sm">
          <Suspense fallback={<PageSpinner />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
