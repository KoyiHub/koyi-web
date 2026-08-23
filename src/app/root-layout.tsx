import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router';

import { PageSpinner } from '@/components/ui/page-spinner';
import { env } from '@/config/env';
import { paths } from '@/config/paths';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { to: paths.home, label: 'Home', end: true },
  { to: paths.users.list, label: 'Users', end: false },
];

export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
          <span className="font-semibold tracking-tight">{env.VITE_APP_NAME}</span>
          <nav aria-label="Main" className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {/* Catches the lazy route chunk while it downloads. */}
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
