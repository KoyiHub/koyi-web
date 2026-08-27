import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router';

import { SchoolCrest } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';
import type { AppNavItem } from '@/config/school-admin-nav';
import { schoolAdminNav } from '@/config/school-admin-nav';
import { schoolQuery } from '@/features/school-admin/api/queries';
import { cn } from '@/lib/utils/cn';

interface SchoolAdminSidebarProps {
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
 * blue bar flush to the sidebar's right edge — hence the `-mr-*` pull, which
 * lets the bar sit on the rail's border rather than inside the pill.
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
 * Dedicated School Admin sidebar — deliberately separate from
 * `TeacherSidebar` so School Admin navigation/role behaviour never mixes with
 * the Teacher shell.
 *
 * Layout follows design reference pages 9-12: the product logo sits in a white
 * band at the top, the school's own crest and name sit directly beneath it,
 * then the primary nav, with Settings and Help pinned to the bottom. Rows come
 * from `schoolAdminNav`, so the same shell can later drive other portals from
 * their own nav config without a rewrite.
 */
export function SchoolAdminSidebar({ open, onClose }: SchoolAdminSidebarProps) {
  const { data: school } = useQuery(schoolQuery());

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
          <SchoolCrest name={school?.name ?? 'Koyi School'} logoUrl={school?.logo_url} />
          <p className="text-koyi-text text-sm leading-snug font-bold">{school?.name ?? ' '}</p>
        </div>

        <nav aria-label="School Admin" className="flex-1 space-y-1 overflow-y-auto py-5 pl-3">
          {schoolAdminNav.primary.map((item) => (
            <NavRow key={item.to} item={item} onNavigate={onClose} />
          ))}
        </nav>

        <div className="border-koyi-border space-y-1 border-t py-4 pl-3">
          {schoolAdminNav.footer.map((item) => (
            <NavRow key={item.to} item={item} onNavigate={onClose} />
          ))}
        </div>
      </aside>
    </>
  );
}
