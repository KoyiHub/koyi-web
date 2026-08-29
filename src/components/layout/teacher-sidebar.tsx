import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';
import type { AppNavItem } from '@/config/app-nav';
import { teacherNav } from '@/config/teacher-nav';
import { teacherProfileQuery } from '@/features/teacher/api/queries';
import { cn } from '@/lib/utils/cn';

interface TeacherSidebarProps {
  /** Whether the collapsible drawer is open on narrow viewports. Ignored at desktop widths. */
  open: boolean;
  onClose: () => void;
}

interface NavRowProps {
  item: AppNavItem;
  onNavigate: () => void;
}

/**
 * One navigation row. The active state is a pale lavender pill with a solid
 * blue bar flush to the sidebar's right edge — the bar sits on the rail's
 * border rather than inside the pill, which is why the row is only rounded on
 * its left side.
 */
function NavRow({ item, onNavigate }: NavRowProps) {
  const { Icon } = item;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'relative flex h-11 items-center gap-3 rounded-l-lg pr-4 pl-4 text-sm transition-colors',
          isActive
            ? 'bg-koyi-nav-active text-koyi-primary font-bold'
            : 'text-koyi-text hover:bg-koyi-nav-active/60 font-medium',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            aria-hidden="true"
            className={cn('size-5 shrink-0', isActive ? 'text-koyi-primary' : 'text-koyi-muted')}
          />
          <span className="truncate">{item.label}</span>

          {isActive && (
            <span
              aria-hidden="true"
              className="bg-koyi-primary absolute inset-y-1 right-0 w-1 rounded-l-full"
            />
          )}
        </>
      )}
    </NavLink>
  );
}

/**
 * Teacher shell sidebar. Persistent on desktop; an off-canvas drawer below
 * `lg`. The same markup renders in both cases — only the transform changes.
 *
 * It deliberately matches the School Admin rail (logo band, identity strip,
 * primary nav, pinned footer) so a teacher who also administers a school
 * meets one navigation model, but it is a separate component driven by
 * `teacherNav`: the two portals never share role behaviour.
 *
 * The identity strip shows the teacher and the class they are responsible
 * for, which is the context every screen below it is scoped to. Profile and
 * logout live behind the topbar avatar, so this footer carries only Settings
 * and Help.
 */
export function TeacherSidebar({ open, onClose }: TeacherSidebarProps) {
  const { data: profile } = useQuery(teacherProfileQuery());

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
          'border-koyi-border bg-koyi-sidebar fixed inset-y-0 left-0 z-50 flex w-[250px] shrink-0 flex-col border-r transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-[100px] shrink-0 items-center bg-white px-6">
          <Logo className="h-10" />
        </div>

        <div className="border-koyi-border flex items-center gap-3 border-y px-5 py-4">
          <InitialsAvatar name={profile?.full_name ?? 'Koyi Teacher'} />
          <div className="min-w-0">
            <p className="text-koyi-text truncate text-sm leading-snug font-bold">
              {profile?.full_name ?? ' '}
            </p>
            <p className="text-koyi-muted truncate text-xs">{profile?.class_name ?? ' '}</p>
          </div>
        </div>

        <nav aria-label="Teacher" className="flex-1 space-y-1 overflow-y-auto py-5 pl-3">
          {teacherNav.primary.map((item) => (
            <NavRow key={item.to} item={item} onNavigate={onClose} />
          ))}
        </nav>

        <div className="border-koyi-border space-y-1 border-t py-4 pl-3">
          {teacherNav.footer.map((item) => (
            <NavRow key={item.to} item={item} onNavigate={onClose} />
          ))}
        </div>
      </aside>
    </>
  );
}
