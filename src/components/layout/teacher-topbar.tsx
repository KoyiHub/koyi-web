import { Link } from 'react-router';

import { BellIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';

interface TeacherTopbarProps {
  onOpenMenu: () => void;
}

/**
 * Slim context bar above the routed page content, matching the recurring
 * topbar pattern in PDF p36-45 ("New Assessment Session" / "Students" /
 * "Groups Overview" / "Class Progress"): left = current class context, right
 * = notification icon plus the profile avatar. Class context is a
 * provisional placeholder — teacher/class selection is not implemented yet.
 * Notifications are presentational only. Settings lives in the sidebar
 * footer, not here, so there is only one profile entry point (this avatar).
 */
export function TeacherTopbar({ onOpenMenu }: TeacherTopbarProps) {
  return (
    <header className="border-koyi-border bg-koyi-card flex h-14 shrink-0 items-center gap-3 border-b px-4 lg:px-6">
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

      <p className="text-koyi-text text-sm font-medium">Primary 4 &middot; Class A</p>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          className="text-koyi-text hover:bg-koyi-surface flex size-11 items-center justify-center rounded-md"
        >
          <BellIcon />
        </button>

        <Link
          to={paths.profile}
          aria-label="Go to your teacher profile"
          title="Teacher profile"
          className="hover:bg-koyi-surface ml-1 flex size-11 items-center justify-center rounded-full"
        >
          <span
            aria-hidden="true"
            className="bg-koyi-primary/10 text-koyi-primary flex size-8 items-center justify-center rounded-full text-xs font-semibold"
          >
            T
          </span>
        </Link>
      </div>
    </header>
  );
}
