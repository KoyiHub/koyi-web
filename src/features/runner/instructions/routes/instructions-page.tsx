import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { CheckCircleIcon, LockIcon } from '@/components/ui/icons';
import { PageSpinner } from '@/components/ui/page-spinner';
import { paths } from '@/config/paths';
import { assessmentOverviewQuery } from '@/features/runner/api/queries';
import type { RunnerSection } from '@/features/runner/api/runner.schema';
import { cn } from '@/lib/utils/cn';

/**
 * The section hub — `frontend-integration.md` §6, §7.5. Sections are taken
 * in order, one at a time; exactly one "Start"/"Continue" button is ever
 * enabled, and every section submit returns here.
 *
 * A `401` here (the sitting expired before the child even started a
 * section) is handled globally — `@/lib/api/runner-client`'s expiry handler,
 * wired in `StudentAssessmentLayout`, sends the child back to `/assessment`
 * before this page needs to render an error state for it.
 */
const DOMAIN_LABEL: Record<'literacy' | 'numeracy', string> = {
  literacy: 'Literacy',
  numeracy: 'Numeracy',
};

function isStartable(status: RunnerSection['status']): boolean {
  return status === 'unlocked' || status === 'in_progress';
}

export function InstructionsPage() {
  const navigate = useNavigate();
  const overview = useQuery(assessmentOverviewQuery());

  if (overview.isPending) {
    return <PageSpinner />;
  }

  if (overview.isError) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 text-center">
        <p className="text-koyi-text text-lg font-semibold">Something went wrong.</p>
        <p className="text-koyi-muted mt-2 text-sm">Please try again in a moment.</p>
      </div>
    );
  }

  const sections = [...overview.data.sections].sort((a, b) => a.order - b.order);
  const nextStartableId = sections.find((section) => isStartable(section.status))?.id;

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="font-display text-koyi-text text-2xl font-bold sm:text-3xl">
        {overview.data.name}
      </h1>
      {overview.data.instructions && (
        <p className="text-koyi-muted mt-2 text-base">{overview.data.instructions}</p>
      )}

      <ol className="mt-8 flex flex-col gap-4">
        {sections.map((section) => {
          const done = section.status === 'submitted';
          const startable = section.id === nextStartableId;

          return (
            <li
              key={section.id}
              className={cn(
                'border-koyi-border flex items-center justify-between gap-4 rounded-2xl border bg-white p-5 shadow-sm',
                !startable && !done && 'opacity-60',
              )}
            >
              <div className="flex min-w-0 items-center gap-4">
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid size-11 shrink-0 place-items-center rounded-full',
                    done
                      ? 'bg-emerald-50 text-emerald-600'
                      : startable
                        ? 'bg-koyi-quiz-hint text-koyi-quiz-accent'
                        : 'bg-koyi-quiz-tile text-koyi-muted',
                  )}
                >
                  {done ? (
                    <CheckCircleIcon className="size-6" />
                  ) : startable ? (
                    <span className="font-display text-lg font-bold">{section.order}</span>
                  ) : (
                    <LockIcon className="size-5" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-koyi-text truncate text-lg font-bold">
                    {section.name}
                  </p>
                  <p className="text-koyi-muted text-sm">
                    {DOMAIN_LABEL[section.domain]} · {section.question_count} questions
                  </p>
                </div>
              </div>

              {startable && (
                <Button
                  className="h-12 shrink-0 px-6 text-base"
                  onClick={() => {
                    void navigate(`${paths.assessment.session}?section=${section.id}`);
                  }}
                >
                  {section.status === 'in_progress' ? 'Continue' : 'Start'}
                </Button>
              )}
              {done && (
                <span className="shrink-0 text-sm font-semibold text-emerald-600">Done</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
