import { Suspense, useEffect, useState } from 'react';
import { Outlet } from 'react-router';

import { SchoolAdminSidebar } from '@/components/layout/school-admin-sidebar';
import { SchoolAdminTopbar } from '@/components/layout/school-admin-topbar';
import { PageSpinner } from '@/components/ui/page-spinner';

/**
 * Dedicated School Admin application shell (Fresh PDF pages 9-12) —
 * deliberately not a reuse of `TeacherLayout`, so navigation and role
 * behaviour never mix between the two portals.
 *
 * Not wrapped in a route guard yet: no confirmed School Admin login endpoint
 * exists (see `useSchoolAdminLogin`), so there is no real session to check
 * without faking one. This mirrors the fixture-only nature of the School
 * Admin screens themselves — wire a `RequireSchoolAdminAuth` guard here once
 * a School Admin auth contract is confirmed.
 */
export function SchoolAdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <div className="bg-koyi-canvas text-koyi-text flex min-h-dvh">
      <SchoolAdminSidebar
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false);
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <SchoolAdminTopbar
          onOpenMenu={() => {
            setMenuOpen(true);
          }}
        />

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Suspense fallback={<PageSpinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
