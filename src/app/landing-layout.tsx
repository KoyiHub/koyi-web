import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

import { PageSpinner } from '@/components/ui/page-spinner';
import { LandingFooter } from '@/features/landing/components/landing-footer';
import { LandingNav } from '@/features/landing/components/landing-nav';

/**
 * Shell for the public entry journey. Every step is its own route rather than
 * local state in one page component, so refreshing mid-signup keeps the user
 * where they were and the browser Back button walks the journey instead of
 * leaving the site.
 *
 * Because the steps swap the `<Outlet />` without a document navigation, the
 * browser keeps the previous scroll position — so we reset it on each step.
 */
export function LandingLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="bg-koyi-canvas flex min-h-dvh flex-col">
      <LandingNav />
      <main className="flex flex-1 flex-col">
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      <LandingFooter />
    </div>
  );
}
