import { NavLink } from 'react-router';

import { GearIcon, HelpIcon } from '@/components/ui/icons';
import { Logo } from '@/components/ui/logo';
import { teacherNavItems } from '@/config/teacher-nav';
import { cn } from '@/lib/utils/cn';

interface TeacherSidebarProps {
  /** Whether the collapsible drawer is open on narrow viewports. Ignored at desktop widths. */
  open: boolean;
  onClose: () => void;
}

/**
 * Persistent on desktop; becomes an off-canvas drawer below the `lg` breakpoint.
 * The same markup renders in both cases — only the transform/visibility change.
 *
 * Profile and logout live solely behind the topbar avatar (see
 * `TeacherTopbar`) so there is exactly one route into the profile screen —
 * this footer only carries Settings and Help.
 */
export function TeacherSidebar({ open, onClose }: TeacherSidebarProps) {
  return (
    <>
      {open && (
        <div
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          'border-koyi-border bg-koyi-card fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="border-koyi-border flex h-16 flex-col justify-center gap-0.5 border-b px-5">
          {/* Smaller than the bare header lockup: here it stacks above a caption
              inside the same 64px band. */}
          <Logo className="h-7" />
          <span className="text-koyi-muted text-[11px] font-semibold tracking-wide uppercase">
            FLN Assessment Platform
          </span>
        </div>

        <nav aria-label="Teacher" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {teacherNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex h-11 items-center rounded-md border-l-4 px-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-koyi-primary border-koyi-accent text-white'
                    : 'text-koyi-text hover:bg-koyi-surface border-transparent',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-koyi-border space-y-1 border-t p-3">
          <span
            aria-disabled="true"
            title="Settings is not available yet"
            className="text-koyi-muted flex h-11 cursor-not-allowed items-center gap-3 rounded-md px-3 text-sm font-medium"
          >
            <GearIcon aria-hidden="true" />
            Settings
          </span>

          <span
            aria-disabled="true"
            title="Help center is not available yet"
            className="text-koyi-muted flex h-11 cursor-not-allowed items-center gap-3 rounded-md px-3 text-sm font-medium"
          >
            <HelpIcon aria-hidden="true" />
            Help
          </span>
        </div>
      </aside>
    </>
  );
}
