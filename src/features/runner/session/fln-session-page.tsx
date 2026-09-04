import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, ArrowRightIcon, ClockIcon } from '@/components/ui/icons';
import { PageSpinner } from '@/components/ui/page-spinner';
import { paths } from '@/config/paths';
import { usePutResponse, useStartSection, useSubmitSection } from '@/features/runner/api/mutations';
import type { PutResponseInput, RunnerSection } from '@/features/runner/api/runner.schema';
import { mapRunnerQuestion } from '@/features/runner/session/api/map-question';
import { QuestionView } from '@/features/runner/session/components/question-view';
import type {
  FlnQuestion,
  QuizRecording,
  QuizResponse,
} from '@/features/runner/session/question-types';
import { isAnswered, MAIN_PART } from '@/features/runner/session/question-types';

/**
 * The student FLN assessment player — `frontend-integration.md` §6, §7.5.
 *
 * Driven by the real endpoints: `start/` opens the section (and, on a
 * resumed sitting, hands back the **original** `expires_at` rather than
 * restarting the clock — B.5), `responses/` autosaves every answer, and the
 * last question's Next *is* `submit/` — there is no separate confirm step
 * (§9). A `finished` submit goes straight to the summary; anything else
 * returns to the instructions hub with the next section unlocked.
 *
 * SECURITY BOUNDARY: no correct answers, marks or scoring reach this file —
 * `runnerQuestionSchema` carries no `is_correct`, so there is nothing here to
 * accidentally render.
 */

function buildResponseInput(
  question: FlnQuestion,
  response: QuizResponse | undefined,
): PutResponseInput {
  if (question.layout === 'spoken') {
    // No recording-upload endpoint is documented yet (frontend-integration.md
    // §6) — the clip stays local for playback and nothing is sent for it.
    // See refactor-plan.md's Phase 2 writeup.
    return { text_value: '', media_id: null, option_ids: [] };
  }
  const selected = response?.selections[MAIN_PART];
  return { text_value: '', media_id: null, option_ids: selected ? [selected] : [] };
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes)}:${String(seconds).padStart(2, '0')}`;
}

function SectionTimedOutCard() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12">
      <div className="border-koyi-border rounded-2xl border bg-white p-8 text-center shadow-sm sm:p-10">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-amber-50">
          <ClockIcon className="size-9 text-amber-600" />
        </span>
        <h1 className="font-display text-koyi-text mt-5 text-2xl font-bold">Time's up for now</h1>
        <p className="text-koyi-muted mt-3 text-base leading-relaxed">
          Your answers so far have already been saved. Your teacher will let you know what happens
          next.
        </p>
      </div>
    </div>
  );
}

export function FlnSessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sectionId = searchParams.get('section') ?? '';

  const startSection = useStartSection();
  const putResponse = usePutResponse();
  const submitSection = useSubmitSection();

  const [section, setSection] = useState<RunnerSection | null>(null);
  const [questions, setQuestions] = useState<FlnQuestion[]>([]);
  const [timedOut, setTimedOut] = useState(false);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, QuizResponse>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const startedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sectionId || startedRef.current === sectionId) return;
    startedRef.current = sectionId;

    startSection.mutate(sectionId, {
      onSuccess: (data) => {
        const expiresAt = data.section.expires_at
          ? new Date(data.section.expires_at).getTime()
          : null;
        if (expiresAt !== null && expiresAt <= Date.now()) {
          setSection(data.section);
          setTimedOut(true);
          return;
        }
        setSection(data.section);
        setQuestions(
          data.questions
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((question) => mapRunnerQuestion(question, data.section.name, data.section.domain)),
        );
      },
      onError: () => {
        void navigate(paths.assessment.instructions, { replace: true });
      },
    });
  }, [sectionId, startSection, navigate]);

  // The countdown, and the guard that stops input once it hits zero mid-section.
  useEffect(() => {
    if (!section?.expires_at || timedOut) return;
    const expiresAt = new Date(section.expires_at).getTime();

    const tick = () => {
      const remaining = expiresAt - Date.now();
      setRemainingMs(remaining);
      if (remaining <= 0) {
        setTimedOut(true);
      }
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => {
      window.clearInterval(interval);
    };
  }, [section?.expires_at, timedOut]);

  const question = questions[index];
  const total = questions.length;
  const isLast = index === total - 1;
  const response = question ? responses[question.id] : undefined;
  const answered = question ? isAnswered(question, response) : false;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    headingRef.current?.focus();
  }, [index]);

  // Autosave: one debounced PUT per answer change, per question.
  useEffect(() => {
    if (!question || timedOut) return;
    const current = responses[question.id];
    if (!current) return;
    const timeout = window.setTimeout(() => {
      putResponse.mutate({ questionId: question.id, input: buildResponseInput(question, current) });
    }, 500);
    return () => {
      window.clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, responses[question?.id ?? '']]);

  const answeredCount = useMemo(
    () => questions.filter((item) => isAnswered(item, responses[item.id])).length,
    [questions, responses],
  );

  function handleSelect(_partId: string, optionId: string) {
    if (!question) return;
    setResponses((current) => ({
      ...current,
      [question.id]: { questionId: question.id, selections: { [MAIN_PART]: optionId } },
    }));
  }

  function handleRecorded(recording: QuizRecording) {
    if (!question) return;
    setResponses((current) => ({
      ...current,
      [question.id]: { questionId: question.id, selections: {}, recording },
    }));
  }

  function handleClearRecording() {
    if (!question) return;
    setResponses((current) => {
      const existing = current[question.id];
      if (!existing?.recording) return current;
      URL.revokeObjectURL(existing.recording.url);
      const { recording: _cleared, ...rest } = existing;
      return { ...current, [question.id]: rest };
    });
  }

  function goNext() {
    if (!isLast) {
      setIndex((current) => Math.min(current + 1, total - 1));
      return;
    }
    submitSection.mutate(sectionId, {
      onSuccess: (data) => {
        if (data.status === 'finished') {
          void navigate(paths.assessment.summary, {
            replace: true,
            state: { answeredCount, total },
          });
        } else {
          void navigate(paths.assessment.instructions, { replace: true });
        }
      },
    });
  }

  if (timedOut) {
    return <SectionTimedOutCard />;
  }

  if (!question) {
    return <PageSpinner />;
  }

  const progress = Math.round(((index + 1) / total) * 100);

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pt-6 pb-32 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-koyi-quiz-accent text-sm font-bold tracking-wide uppercase">
              {question.section}
            </p>
            <div className="flex items-center gap-3">
              {remainingMs !== null && (
                <p className="text-koyi-muted flex items-center gap-1.5 text-sm font-semibold">
                  <ClockIcon className="size-4" />
                  {formatCountdown(remainingMs)}
                </p>
              )}
              <p className="text-koyi-muted text-sm font-semibold">
                Question {index + 1} out of {total}
              </p>
            </div>
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
              isLoading={isLast && submitSection.isPending}
              className="bg-koyi-quiz-accent hover:bg-koyi-quiz-accent-hover h-12 px-5 text-base sm:px-7"
            >
              {isLast ? 'Finish section' : 'Next'}
              {!isLast && <ArrowRightIcon className="size-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
