import { Link, Navigate } from 'react-router';

import { paths } from '@/config/paths';
import { getAuthToken } from '@/lib/auth/token-store';

/**
 * Public marketing/entry screen at "/". An already-authenticated teacher is
 * sent straight to the dashboard rather than shown the pitch again — this is
 * a landing page, not a route that should sit between a logged-in teacher
 * and their work.
 */
export function WelcomePage() {
  if (getAuthToken()) {
    return <Navigate to={paths.dashboard} replace />;
  }

  return (
    <div className="bg-koyi-surface flex min-h-dvh flex-col">
      <header className="border-koyi-border bg-koyi-card border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="text-koyi-primary text-lg font-semibold tracking-tight">Koyi</span>
          <a href="#help" className="text-koyi-text text-sm font-medium hover:underline">
            Help
          </a>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <div>
          <p className="text-koyi-primary text-sm font-semibold tracking-wide uppercase">
            Step 1 of 5
          </p>
          <h1 className="text-koyi-text mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Welcome to Koyi
          </h1>
          <p className="text-koyi-text mt-4 text-lg font-medium">
            Smarter assessment. Better teaching. Stronger learning.
          </p>
          <p className="text-koyi-muted mt-3 max-w-md text-base">
            Koyi helps teachers assess foundational literacy and numeracy, spot learning gaps early,
            and act on a clear, class-by-class picture of every student&apos;s progress.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to={paths.onboarding.role}
              className="bg-koyi-primary hover:bg-koyi-primary-hover rounded-md px-4 py-3 text-center text-sm font-medium text-white transition-colors"
            >
              Get Started
            </Link>
            <Link
              to={paths.auth.login}
              className="text-koyi-primary text-center text-sm font-medium hover:underline sm:text-left"
            >
              I already have an account
            </Link>
          </div>

          <p className="text-koyi-muted mt-10 text-xs font-medium tracking-wide uppercase">
            Trusted by educators across Nigeria
          </p>
        </div>

        <div className="relative">
          {/* Illustration placeholder — replace with the approved Figma
              hero illustration asset once available; not shipped here. */}
          <div className="border-koyi-border bg-koyi-card flex aspect-4/3 w-full items-center justify-center rounded-2xl border-2 border-dashed">
            <span className="text-koyi-muted text-sm">Illustration placeholder</span>
          </div>

          <div className="rounded-koyi-lg border-koyi-border bg-koyi-card absolute -bottom-4 -left-4 border p-3 shadow-md sm:-left-6">
            <p className="text-koyi-success text-sm font-semibold">Class Average +14% Growth</p>
          </div>

          <div className="rounded-koyi-lg border-koyi-border bg-koyi-card absolute -top-4 -right-2 border p-3 shadow-md sm:-right-4">
            <p className="text-koyi-text text-sm font-semibold">Literacy Module Completed</p>
          </div>
        </div>
      </main>

      <footer className="border-koyi-border border-t">
        <div className="text-koyi-muted mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs sm:flex-row sm:px-6">
          <p>&copy; 2026 Koyi FLN Platform</p>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="hover:underline">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:underline">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
