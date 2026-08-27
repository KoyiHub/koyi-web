import { Link } from 'react-router';

import { paths } from '@/config/paths';

/**
 * No student-creation route exists yet anywhere in the app, so "Add Student"
 * is rendered inert (matching the existing disabled-link pattern used for
 * "Forgot password?" on the login page) rather than pointing at a page that
 * doesn't exist.
 */
export function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-heading" className="space-y-3">
      <h2 id="quick-actions-heading" className="text-koyi-text text-lg font-semibold">
        Quick Actions
      </h2>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <li>
          <Link
            to={paths.teacher.assessment.setup}
            className="rounded-koyi-lg border-koyi-border bg-koyi-card hover:border-koyi-primary hover:bg-koyi-primary/5 text-koyi-text flex min-h-18 flex-col justify-center gap-0.5 border p-4 text-sm font-medium transition-colors"
          >
            Start Assessment
            <span className="text-koyi-muted text-xs font-normal">
              Set up a new assessment session
            </span>
          </Link>
        </li>
        <li>
          <span
            aria-disabled="true"
            title="Not available yet"
            className="rounded-koyi-lg border-koyi-border bg-koyi-surface text-koyi-muted flex min-h-18 cursor-not-allowed flex-col justify-center gap-0.5 border p-4 text-sm font-medium"
          >
            Add Student
            <span className="text-xs font-normal">Not available yet</span>
          </span>
        </li>
      </ul>
    </section>
  );
}
