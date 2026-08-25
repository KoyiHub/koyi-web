import { Suspense } from 'react';
import { Outlet } from 'react-router';

import { PageSpinner } from '@/components/ui/page-spinner';

/**
 * Minimal shell for the student assessment session. Deliberately excludes the
 * teacher sidebar/topbar — this is a separate experience from the teacher
 * dashboard shell, not a page nested inside it.
 */
export function AssessmentLayout() {
  return (
    <div className="bg-koyi-surface text-koyi-text flex min-h-dvh flex-col">
      <header className="border-koyi-border bg-koyi-card border-b px-4 py-4 lg:px-8">
        <span className="text-koyi-primary text-lg font-semibold tracking-tight">Koyi</span>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 lg:px-8">
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
