import { NavLink } from 'react-router';

import { teacherNavItems, teacherProfileNavItem } from '@/config/teacher-nav';
import { cn } from '@/lib/utils/cn';

interface TeacherSidebarProps {
  /** Whether the collapsible drawer is open on narrow viewports. Ignored at desktop widths. */
  open: boolean;
  onClose: () => void;
}

/**
 * Persistent on desktop; becomes an off-canvas drawer below the `lg` breakpoint.
 * The same markup renders in both cases — only the transform/visibility change.
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
        <div className="border-koyi-border flex h-14 items-center gap-2 border-b px-5">
          <span className="text-koyi-primary text-lg font-semibold tracking-tight">Koyi</span>
          <span className="text-koyi-muted text-xs font-medium">FLN Assessment Platform</span>
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
                  'flex h-11 items-center rounded-md px-3 text-sm font-medium transition-colors',
                  isActive ? 'bg-koyi-primary text-white' : 'text-koyi-text hover:bg-koyi-surface',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-koyi-border border-t p-3">
          <NavLink
            to={teacherProfileNavItem.to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
                isActive ? 'bg-koyi-primary text-white' : 'text-koyi-text hover:bg-koyi-surface',
              )
            }
          >
            <span
              aria-hidden="true"
              className="bg-koyi-surface text-koyi-primary flex size-8 items-center justify-center rounded-full text-xs font-semibold"
            >
              T
            </span>
            Teacher profile
          </NavLink>
        </div>
      </aside>
    </>
  );
}
