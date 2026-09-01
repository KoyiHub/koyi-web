import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { QuestionView } from '@/features/assessment/components/question-view';
import type { QuizRecording, QuizResponse } from '@/features/assessment/data/fln-session-fixture';
import {
  flnQuestions,
  isAnswered,
  questionAt,
} from '@/features/assessment/data/fln-session-fixture';

/**
 * The student FLN assessment player.
 *
 * Holds the whole session: which question is on screen, and every answer given
 * so far. Answers are keyed by question id and, within a question, by part id,
 * so a screen that asks two things records two selections.
 *
 * PROVISIONAL: questions come from a local fixture and answers are held in
 * component state. When the Django session endpoints are confirmed, the
 * fixture becomes a query and `responses` becomes a mutation — the screens
 * below do not change (CLAUDE.md, Backend/API readiness).
 *
 * SECURITY BOUNDARY: no correct answers, marks or scoring reach this file.
 * Submitting hands the answers on and shows how much was completed, never a
 * result.
 */
export function FlnSessionPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, QuizResponse>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);

  const question = questionAt(index);
  const total = flnQuestions.length;
  const isLast = index === total - 1;
  const response = responses[question.id];
  const answered = isAnswered(question, response);

  const answeredCount = useMemo(
    () => flnQuestions.filter((item) => isAnswered(item, responses[item.id])).length,
    [responses],
  );

  // Moving between questions must land the child at the top of the new
  // question and tell a screen reader the screen changed.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    headingRef.current?.focus();
  }, [index]);

  const handleSelect = useCallback(
    (partId: string, optionId: string) => {
      setResponses((current) => {
        const existing = current[question.id];
        return {
          ...current,
          [question.id]: {
            ...existing,
            questionId: question.id,
            selections: { ...existing?.selections, [partId]: optionId },
          },
        };
      });
    },
    [question.id],
  );

  const handleRecorded = useCallback(
    (recording: QuizRecording) => {
      setResponses((current) => ({
        ...current,
        [question.id]: {
          questionId: question.id,
          selections: current[question.id]?.selections ?? {},
          recording,
        },
      }));
    },
    [question.id],
  );

  const handleClearRecording = useCallback(() => {
    setResponses((current) => {
      const existing = current[question.id];
      if (!existing?.recording) {
        return current;
      }
      // The blob stays in memory until its object URL is revoked.
      URL.revokeObjectURL(existing.recording.url);
      const { recording: _cleared, ...rest } = existing;
      return { ...current, [question.id]: rest };
    });
  }, [question.id]);

  const goNext = () => {
    if (isLast) {
      void navigate(paths.assessment.summary, {
        state: { answeredCount, total },
        replace: true,
      });
      return;
    }
    setIndex((current) => Math.min(current + 1, total - 1));
  };

  const progress = Math.round(((index + 1) / total) * 100);

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pt-6 pb-32 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-koyi-quiz-accent text-sm font-bold tracking-wide uppercase">
              {question.section}
            </p>
            <p className="text-koyi-muted text-sm font-semibold">
              Question {index + 1} out of {total}
            </p>
          </div>

          <div
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={index + 1}
            aria-label="Assessment progress"
            className="bg-koyi-quiz-track h-2.5 w-full overflow-hidden rounded-full"
          >
            <div
              className="bg-koyi-quiz-accent h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${String(progress)}%` }}
            />
          </div>
        </header>

        <h1 ref={headingRef} tabIndex={-1} className="sr-only">
          {question.section} — question {index + 1} of {total}
        </h1>

        <main className="mt-8 flex-1">
          <QuestionView
            key={question.id}
            question={question}
            response={response}
            onSelect={handleSelect}
            onRecorded={handleRecorded}
            onClearRecording={handleClearRecording}
          />
        </main>
      </div>

      {/* Pinned so Previous and Next stay reachable however long the passage. */}
      <div className="border-koyi-border/70 fixed inset-x-0 bottom-0 border-t bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-6 lg:px-8">
          <Button
            variant="secondary"
            onClick={() => {
              setIndex((current) => Math.max(current - 1, 0));
            }}
            disabled={index === 0}
            className="h-12 px-4 text-base sm:px-6"
          >
            <ArrowLeftIcon className="size-4" />
            Previous
          </Button>

          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            {question.layout === 'spoken' && !answered && (
              <button
                type="button"
                onClick={goNext}
                className="text-koyi-muted hover:text-koyi-text min-h-11 shrink-0 text-sm font-semibold underline underline-offset-4"
              >
                Skip for now
              </button>
            )}

            <Button
              onClick={goNext}
              disabled={!answered}
              className="bg-koyi-quiz-accent hover:bg-koyi-quiz-accent-hover h-12 px-5 text-base sm:px-7"
            >
              {isLast ? 'Submit' : 'Next'}
              {!isLast && <ArrowRightIcon className="size-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
