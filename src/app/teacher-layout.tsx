import { Suspense, useEffect, useState } from 'react';
import { Outlet } from 'react-router';

import { TeacherSidebar } from '@/components/layout/teacher-sidebar';
import { TeacherTopbar } from '@/components/layout/teacher-topbar';
import { PageSpinner } from '@/components/ui/page-spinner';

export function TeacherLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    // The drawer overlays the page below `lg`; stop the content scrolling behind it.
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <div className="bg-koyi-surface text-koyi-text flex min-h-dvh">
      <TeacherSidebar
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false);
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TeacherTopbar
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
