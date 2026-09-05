import { useLocation } from 'react-router';

import { CheckCircleIcon } from '@/components/ui/icons';

/**
 * What the child sees after Submit.
 *
 * Deliberately shows completion, not performance: how many questions were
 * answered, and that a teacher will look at the work. Marking an FLN
 * assessment is the backend's job and its labels are not confirmed yet
 * (CLAUDE.md), so no score, band or "correct" count appears here.
 */

interface SummaryState {
  answeredCount: number;
  total: number;
}

function isSummaryState(value: unknown): value is SummaryState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const state = value as Record<string, unknown>;
  return typeof state.answeredCount === 'number' && typeof state.total === 'number';
}

export function FlnSummaryPage() {
  const location = useLocation();
  const state = isSummaryState(location.state) ? location.state : null;
  const total = state?.total ?? 0;
  const answeredCount = state?.answeredCount ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-12 sm:px-6">
      <div className="border-koyi-border rounded-2xl border bg-white p-8 text-center shadow-sm sm:p-10">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50">
          <CheckCircleIcon className="size-9 text-emerald-600" />
        </span>

        <h1 className="font-display text-koyi-text mt-5 text-3xl font-bold">All done!</h1>
        <p className="text-koyi-muted mt-2 text-lg">Well done for finishing the assessment.</p>

        <dl className="bg-koyi-quiz-tile mt-7 rounded-2xl px-6 py-5">
          <dt className="text-koyi-muted text-sm font-semibold">Questions answered</dt>
          <dd className="font-display text-koyi-quiz-accent mt-1 text-4xl font-extrabold">
            {answeredCount}
            <span className="text-koyi-muted text-2xl font-bold"> / {total}</span>
          </dd>
        </dl>

        <p className="text-koyi-muted mt-5 text-sm leading-relaxed">
          Your answers have been saved. Your teacher will review them and go through the results
          with you — there is nothing more to do here.
        </p>

        {/*
          A child never crosses into the teacher application from here. Once the
          last section is in, the sitting is over and there is nothing more for
          them to do — so this offers no onward link at all.
        */}
      </div>
    </div>
  );
}
