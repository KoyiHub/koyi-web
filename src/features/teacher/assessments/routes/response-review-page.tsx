import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { CheckIcon, ClockIcon, CloseIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { studentResponsesQuery } from '@/features/teacher/assessments/api/queries';
import type { ReviewQuestion } from '@/features/teacher/assessments/api/results.schema';
import { cn } from '@/lib/utils/cn';

/**
 * One child's paper, question by question — `frontend-integration.md` §5.5.
 *
 * Green/red straight from `is_correct` + `was_selected`, no cross-referencing.
 * **Three-state, not two**: `is_correct: null` is pending, not wrong, and is
 * rendered as its own neutral state rather than a red mark (A.2). This is the
 * only screen in the app that shows an answer key — to a teacher, after the
 * fact.
 */
type Outcome = 'correct' | 'incorrect' | 'pending' | 'unanswered';

function outcomeFor(question: ReviewQuestion): Outcome {
  if (!question.response) return 'unanswered';
  if (question.response.is_correct === null) return 'pending';
  return question.response.is_correct ? 'correct' : 'incorrect';
}

const OUTCOME_LABEL: Record<Outcome, string> = {
  correct: 'Correct',
  incorrect: 'Incorrect',
  pending: 'Still being marked',
  unanswered: 'Not answered',
};

const OUTCOME_CLASS: Record<Outcome, string> = {
  correct: 'bg-koyi-band-strong-soft text-koyi-band-strong-ink',
  incorrect: 'bg-koyi-band-struggling-soft text-koyi-band-struggling-ink',
  pending: 'bg-amber-100 text-amber-800',
  unanswered: 'bg-koyi-surface text-koyi-muted',
};

function QuestionCard({ question }: { question: ReviewQuestion }) {
  const outcome = outcomeFor(question);
  const isOptionBased = question.options.length > 0;

  return (
    <Card bodyClassName="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-koyi-muted text-xs font-semibold uppercase">
            {question.section_name} · {question.subskill_name} · Level {question.fln_level}
          </p>
          <p className="text-koyi-text mt-1 font-semibold">{question.text}</p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-1 text-xs font-bold',
            OUTCOME_CLASS[outcome],
          )}
        >
          {OUTCOME_LABEL[outcome]}
        </span>
      </div>

      {isOptionBased ? (
        <ul className="flex flex-wrap gap-2">
          {question.options.map((option) => (
            <li
              key={option.id}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm',
                option.is_correct
                  ? 'border-koyi-band-strong-ink/40 bg-koyi-band-strong-soft text-koyi-band-strong-ink'
                  : option.was_selected
                    ? 'border-koyi-band-struggling-ink/40 bg-koyi-band-struggling-soft text-koyi-band-struggling-ink'
                    : 'border-koyi-border text-koyi-muted',
              )}
            >
              {option.is_correct ? (
                <CheckIcon className="size-3.5" />
              ) : option.was_selected ? (
                <CloseIcon className="size-3.5" />
              ) : null}
              {option.value}
              {option.was_selected && <span className="font-semibold">(chosen)</span>}
            </li>
          ))}
        </ul>
      ) : (
        question.response && (
          <p className="bg-koyi-surface text-koyi-text rounded-md p-3 text-sm">
            {question.response.transcript ||
              question.response.text_value ||
              '(no written answer recorded)'}
          </p>
        )
      )}

      {outcome === 'pending' && (
        <p className="flex items-center gap-1.5 text-xs text-amber-800">
          <ClockIcon className="size-3.5" />
          The AI marker hasn't settled this one yet — check back later, or see the review queue.
        </p>
      )}

      {question.response?.observation_note && (
        <p className="text-koyi-muted text-xs">{question.response.observation_note}</p>
      )}
    </Card>
  );
}

export function ResponseReviewPage() {
  const { assessmentId = '', studentId = '' } = useParams();
  const responses = useQuery({
    ...studentResponsesQuery(assessmentId, studentId),
    enabled: Boolean(assessmentId) && Boolean(studentId),
  });

  if (responses.isPending) return <PageSpinner />;
  if (responses.isError || !responses.data) {
    return <ErrorState error={responses.error} onRetry={() => void responses.refetch()} />;
  }

  const data = responses.data;
  const sortedQuestions = [...data.questions].sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <PageHeader
        title={data.full_name}
        subtitle={`${data.assessment_name} — ${String(data.items_correct)} of ${String(data.items_attempted)} correct so far${data.pending > 0 ? `, ${String(data.pending)} still settling` : ''}`}
      />

      <div className="flex flex-col gap-4">
        {sortedQuestions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
    </div>
  );
}
