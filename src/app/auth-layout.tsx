import { Suspense } from 'react';
import { Outlet } from 'react-router';

import { PageSpinner } from '@/components/ui/page-spinner';

/**
 * Minimal public shell for /login and /signup. Deliberately excludes the
 * teacher sidebar/topbar — this is a separate, unauthenticated experience,
 * not a page nested inside the teacher shell.
 */
export function AuthLayout() {
  return (
    <div className="bg-koyi-surface flex min-h-dvh">
      <div className="bg-koyi-primary relative hidden w-[40%] max-w-md flex-col justify-between overflow-hidden px-10 py-12 lg:flex">
        <span className="text-lg font-semibold tracking-tight text-white">Koyi</span>

        <div>
          <p className="text-2xl leading-snug font-semibold text-white">
            Every child can read, write, and count with confidence.
          </p>
          <p className="mt-3 text-sm text-white/70">
            Koyi gives teachers a clear, class-by-class picture of foundational literacy and
            numeracy — no guesswork, just evidence.
          </p>
        </div>

        <span className="text-xs text-white/50">Foundational literacy &amp; numeracy</span>
      </div>

      <div className="flex flex-1 flex-col">
        <header className="px-4 py-6 lg:hidden">
          <span className="text-koyi-primary text-lg font-semibold tracking-tight">Koyi</span>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <Suspense fallback={<PageSpinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
