import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { BellIcon, PlayIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { teacherProfileQuery } from '@/features/teacher/api/queries';

interface TeacherTopbarProps {
  onOpenMenu: () => void;
}

/**
 * Teacher shell topbar: the menu toggle below `lg`, then Start Assessment,
 * notifications and the profile avatar pinned right.
 *
 * Start Assessment lives here rather than in the sidebar because it is
 * something a teacher *does*, not somewhere they go — and they do it from
 * wherever they happen to be when a child sits down with them, so it stays
 * reachable on every screen. It hands off to the assessment runner's own
 * entry page (`/assessment`) — a bare-chrome surface with no teacher shell,
 * where the child types their two codes to start sitting.
 *
 * Notifications are presentational only: no notification endpoint is
 * confirmed. Settings lives in the sidebar footer, so the avatar is the only
 * entry point to the profile screen.
 */
export function TeacherTopbar({ onOpenMenu }: TeacherTopbarProps) {
  const { data: profile } = useQuery(teacherProfileQuery());

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
        <Link
          to={paths.assessment.entry}
          className="bg-koyi-primary hover:bg-koyi-primary-hover focus-visible:outline-koyi-primary rounded-koyi-md flex h-10 items-center gap-2 px-4 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <PlayIcon className="size-4 fill-none stroke-current stroke-2" />
          <span className="hidden sm:inline">Start Assessment</span>
          <span className="sm:hidden">Start</span>
        </Link>

        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          className="border-koyi-border text-koyi-text hover:bg-koyi-surface flex size-10 items-center justify-center rounded-full border bg-white"
        >
          <BellIcon />
        </button>

        <Link
          to={paths.teacher.profile}
          aria-label="Go to your teacher profile"
          title="Teacher profile"
          className="focus-visible:outline-koyi-primary rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <InitialsAvatar name={profile?.full_name ?? 'Koyi Teacher'} />
        </Link>
      </div>
    </header>
  );
}
