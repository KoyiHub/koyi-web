import { Suspense } from 'react';
import { Link, NavLink, Outlet } from 'react-router';

import { Logo } from '@/components/ui/logo';
import { PageSpinner } from '@/components/ui/page-spinner';
import { paths } from '@/config/paths';
import { cn } from '@/lib/utils/cn';

/**
 * Public shell for the whole `/login/*` journey: the role chooser and both
 * role forms sit inside it, so the header never re-renders when you switch
 * between them.
 *
 * The two role names in the header are real links, not decoration — someone
 * who lands on the wrong form is one click from the right one. Teacher and
 * School Admin remain separate applications; this shared shell is only the
 * front door.
 */
const ROLE_LINKS = [
  { to: paths.login.schoolAdmin, label: 'School Admin' },
  { to: paths.login.teacher, label: 'School Teacher' },
];

export function LoginLayout() {
  return (
    <div className="bg-koyi-surface flex min-h-dvh flex-col">
      <header className="border-koyi-border bg-koyi-card border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to={paths.landing.welcome}
            aria-label="Koyi home"
            className="rounded-koyi-sm focus-visible:outline-koyi-primary flex h-11 items-center focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <Logo />
          </Link>

          <nav aria-label="Log in as" className="flex items-center gap-1 text-sm font-medium">
            {ROLE_LINKS.map((link, index) => (
              <span key={link.to} className="flex items-center gap-1">
                {index > 0 && (
                  <span className="text-koyi-border" aria-hidden="true">
                    |
                  </span>
                )}
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-koyi-sm flex h-11 items-center px-2 transition-colors',
                      isActive ? 'text-koyi-primary' : 'text-koyi-muted hover:text-koyi-primary',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </span>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
