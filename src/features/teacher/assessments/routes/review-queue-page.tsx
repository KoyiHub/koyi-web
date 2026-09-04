import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';

import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ArrowRightIcon, ClockIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { paths } from '@/config/paths';
import { reviewQueueQuery } from '@/features/teacher/assessments/api/queries';

/**
 * Responses the AI could not settle — `frontend-integration.md` §5.5.
 *
 * `is_correct: null` means pending, not wrong, and "needs a teacher" per the
 * guide. But **no endpoint anywhere lets a teacher resolve one** — nothing in
 * `frontend-integration.md` accepts a decision for a pending response. This
 * page is deliberately read-only: it names what's waiting and links into
 * that child's paper for context, rather than offering an action that would
 * fail. Flag the missing resolution endpoint before this ships past mocks.
 */
export function ReviewQueuePage() {
  const { assessmentId = '' } = useParams();
  const queue = useQuery({ ...reviewQueueQuery(assessmentId), enabled: Boolean(assessmentId) });

  if (queue.isPending) return <PageSpinner />;
  if (queue.isError || !queue.data) {
    return <ErrorState error={queue.error} onRetry={() => void queue.refetch()} />;
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <PageHeader
        title="Review queue"
        subtitle="Responses the AI marker hasn't settled yet — open a child's paper to see one in context."
      />

      {queue.data.length === 0 ? (
        <EmptyState
          icon={<ClockIcon className="size-6" />}
          title="Nothing waiting"
          description="Every response for this paper has been marked."
        />
      ) : (
        <Card bodyClassName="p-0">
          <ul className="divide-koyi-border divide-y">
            {queue.data.map((item) => (
              <li
                key={`${item.student_id}-${item.question_id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="text-koyi-text font-semibold">{item.full_name}</p>
                  <p className="text-koyi-muted mt-0.5 text-sm">{item.question_text}</p>
                  <p className="text-koyi-muted mt-1 text-xs">
                    {item.subskill_name} · {item.reason_label}
                  </p>
                </div>
                <Link
                  to={paths.teacher.assessments.responses(assessmentId, item.student_id)}
                  className="text-koyi-primary inline-flex shrink-0 items-center gap-1 text-sm font-bold hover:underline"
                >
                  Open paper
                  <ArrowRightIcon aria-hidden="true" className="size-4" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
