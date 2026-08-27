import { useQuery } from '@tanstack/react-query';

import { SchoolCrest } from '@/components/ui/avatar';
import { BellIcon } from '@/components/ui/icons';
import { schoolQuery } from '@/features/school-admin/api/queries';

interface SchoolAdminTopbarProps {
  onOpenMenu: () => void;
}

/**
 * School Admin shell topbar (design reference page 9) — a thin band that is
 * empty at the left on desktop, with notifications and the school crest at the
 * far right. The menu toggle only appears below `lg`, where the sidebar
 * collapses into a drawer.
 *
 * No School Admin profile route exists yet, so the crest is presentational
 * rather than a link to a Teacher route.
 */
export function SchoolAdminTopbar({ onOpenMenu }: SchoolAdminTopbarProps) {
  const { data: school } = useQuery(schoolQuery());

  return (
    <header className="border-koyi-border bg-koyi-card flex h-16 shrink-0 items-center gap-3 border-b px-4 lg:px-8">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation menu"
        className="text-koyi-text hover:bg-koyi-surface flex size-11 items-center justify-center rounded-md lg:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-5 fill-none stroke-current stroke-2"
        >
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          className="border-koyi-border text-koyi-text hover:bg-koyi-surface flex size-10 items-center justify-center rounded-full border bg-white"
        >
          <BellIcon />
        </button>

        <SchoolCrest name={school?.name ?? 'Koyi School'} logoUrl={school?.logo_url} />
      </div>
    </header>
  );
}
