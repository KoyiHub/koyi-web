import { Suspense } from 'react';
import { Outlet, useNavigate } from 'react-router';

import { ArrowLeftIcon, HelpIcon, MoreIcon } from '@/components/ui/icons';
import { PageSpinner } from '@/components/ui/page-spinner';
import { paths } from '@/config/paths';

/**
 * Chrome for the student FLN assessment player.
 *
 * Deliberately minimal: a child sitting the assessment sees a title, a way
 * out, and help — nothing else. No sidebar, no teacher navigation, no account
 * menu. The teacher shell is a different application (see CLAUDE.md).
 *
 * The bar is `sticky` rather than `fixed` so long passages (question 12) scroll
 * under it without the page needing a compensating top padding.
 */
export function StudentAssessmentLayout() {
  const navigate = useNavigate();

  return (
    <div className="bg-koyi-canvas text-koyi-text flex min-h-dvh flex-col">
      <header className="border-koyi-border bg-koyi-card sticky top-0 z-30 border-b">
        <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
          <button
            type="button"
            onClick={() => {
              void navigate(paths.teacher.assessments.list);
            }}
            aria-label="Leave assessment"
            className="text-koyi-primary hover:bg-koyi-surface border-koyi-border flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors"
          >
            <ArrowLeftIcon className="size-5" />
          </button>

          <p className="font-display text-koyi-primary text-lg font-extrabold tracking-tight">
            Koyi Assessment
          </p>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              aria-label="Get help with this question"
              className="text-koyi-muted hover:bg-koyi-surface hover:text-koyi-text flex size-10 items-center justify-center rounded-full transition-colors"
            >
              <HelpIcon className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Assessment options"
              className="text-koyi-muted hover:bg-koyi-surface hover:text-koyi-text flex size-10 items-center justify-center rounded-full transition-colors"
            >
              <MoreIcon className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
