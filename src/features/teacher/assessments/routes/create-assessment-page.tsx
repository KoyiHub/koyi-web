import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ClipboardIcon, LayersIcon, PlusIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { TextareaField } from '@/components/ui/textarea-field';
import { paths } from '@/config/paths';
import {
  ASSESSMENT_TYPE_LABEL,
  DIFFICULTY_LABEL,
  QUESTION_TYPE_LABEL,
  SUBJECT_LABEL,
} from '@/features/teacher/api/format';
import type { AssessmentSubject, AssessmentType } from '@/features/teacher/api/shared.schema';
import type { Difficulty } from '@/features/teacher/assessments/api/assessment.schema';
import { useCreateAssessment } from '@/features/teacher/assessments/api/mutations';
import { questionLayoutsQuery } from '@/features/teacher/assessments/api/queries';
import { QuestionEditor } from '@/features/teacher/assessments/components/question-editor';
import {
  type AssessmentDraft,
  clearDraft,
  type DraftQuestion,
  duplicateQuestion,
  emptyDraft,
  emptyQuestion,
  readDraft,
  writeDraft,
} from '@/features/teacher/assessments/lib/draft';
import { cn } from '@/lib/utils/cn';

type Step = 'details' | 'questions';

const SUBJECTS: AssessmentSubject[] = ['literacy', 'numeracy'];
const TYPES: AssessmentType[] = ['baseline', 'midline', 'endline', 'practice'];
const DIFFICULTIES: Difficulty[] = ['foundation', 'core', 'stretch'];
const GRADES = [1, 2, 3, 4, 5, 6];

/**
 * What must be true before a question can be saved.
 *
 * Deliberately shallow: it catches the mistakes that would produce a broken
 * question on a child's screen, and leaves everything else to the server,
 * which has to enforce the same rules for requests this form never sent.
 */
function validateQuestion(question: DraftQuestion): string | undefined {
  if (question.source === 'bank') return undefined;

  if (!question.text.trim()) return 'Give this question a title.';

  const emptyBlock = question.contents.some((content) =>
    content.type === 'text' ? !content.text_content.trim() : !content.media_name,
  );
  if (emptyBlock) return 'One of the blocks is empty. Fill it in or remove it.';

  if (question.options.length > 0) {
    if (question.options.some((option) => !option.value.trim())) {
      return 'Every option needs something written on it.';
    }
    if (!question.options.some((option) => option.is_correct)) {
      return 'Tick the correct answer.';
    }
  }

  return undefined;
}

/**
 * The assessment builder.
 *
 * Two steps here — what the assessment is, then the questions — and a third,
 * assigning it, on its own screen. Everything lives in a `sessionStorage`
 * draft rather than in component state alone, because "Add from question bank"
 * is a full navigation away and a teacher who loses twenty minutes of typing
 * to it does not come back.
 */
export function CreateAssessmentPage() {
  const navigate = useNavigate();
  const create = useCreateAssessment();
  const layouts = useQuery(questionLayoutsQuery());

  const [draft, setDraft] = useState<AssessmentDraft>(() => readDraft() ?? emptyDraft());
  // Coming back from the bank means the questions step is where the teacher
  // left off, so the builder reopens there rather than at the details form.
  const [step, setStep] = useState<Step>(() =>
    draft.questions.length > 0 ? 'questions' : 'details',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [detailsError, setDetailsError] = useState<string>();

  const questionsRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    writeDraft(draft);
  }, [draft]);

  const details = draft.details;
  const totalPoints = draft.questions.reduce((sum, question) => sum + question.point, 0);

  const patchDetails = (fields: Partial<AssessmentDraft['details']>) => {
    setDraft((current) => ({ ...current, details: { ...current.details, ...fields } }));
  };

  const patchQuestion = (id: string, next: DraftQuestion) => {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((question) => (question.id === id ? next : question)),
    }));
  };

  const addQuestion = () => {
    setDraft((current) => ({
      ...current,
      questions: [...current.questions, emptyQuestion(current.details)],
    }));

    // The new box is at the bottom of a long page; take the teacher to it.
    window.requestAnimationFrame(() => {
      const boxes = questionsRef.current?.children;
      boxes?.[boxes.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    setDraft((current) => {
      const questions = [...current.questions];
      const moved = questions[index];
      const displaced = questions[index + direction];
      if (!moved || !displaced) return current;

      questions[index] = displaced;
      questions[index + direction] = moved;
      return { ...current, questions };
    });
  };

  const goToQuestions = () => {
    if (!details.title.trim()) {
      setDetailsError('Give the assessment a name before you add questions.');
      return;
    }

    setDetailsError(undefined);
    setStep('questions');
  };

  const goToAssign = () => {
    if (draft.questions.length === 0) {
      setErrors({ form: 'Add at least one question.' });
      return;
    }

    const found: Record<string, string> = {};
    for (const question of draft.questions) {
      const problem = validateQuestion(question);
      if (problem) found[question.id] = problem;
    }

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    create.mutate(draft, {
      onSuccess: (created) => {
        // The assign step needs the server's id, and it must survive a refresh
        // of that page — so it goes in the draft, not in navigate state.
        const next = { ...draft, created_id: created.id };
        writeDraft(next);
        setDraft(next);
        void navigate(paths.teacher.assessments.assign);
      },
    });
  };

  const openBank = () => {
    writeDraft(draft);
    void navigate(paths.teacher.questionBank);
  };

  const discard = () => {
    clearDraft();
    void navigate(paths.teacher.assessments.list);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create assessment"
        subtitle="Build it once, assign it to as many children as you need."
        actions={
          <Button variant="ghost" onClick={discard}>
            Discard draft
          </Button>
        }
      />

      <ol className="border-koyi-border flex flex-wrap items-center gap-x-3 gap-y-2 border-b pb-4 text-sm">
        {(
          [
            ['details', 'Details'],
            ['questions', 'Questions'],
            ['assign', 'Assign'],
          ] as const
        ).map(([key, label], index) => {
          const state =
            key === step ? 'current' : key === 'details' && step === 'questions' ? 'done' : 'todo';

          return (
            <li key={key} className="flex items-center gap-3">
              {index > 0 && (
                <span aria-hidden="true" className="text-koyi-muted">
                  /
                </span>
              )}
              <span
                className={cn(
                  'inline-flex items-center gap-2 font-semibold',
                  state === 'current'
                    ? 'text-koyi-primary'
                    : state === 'done'
                      ? 'text-koyi-text'
                      : 'text-koyi-muted',
                )}
                aria-current={state === 'current' ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full text-xs font-bold',
                    state === 'current'
                      ? 'bg-koyi-primary text-white'
                      : 'bg-koyi-surface text-koyi-muted',
                  )}
                >
                  {index + 1}
                </span>
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          {step === 'details' && (
            <Card title="Assessment details" subtitle="What this is, and who it is for.">
              <div className="space-y-4">
                <TextField
                  label="Assessment title"
                  value={details.title}
                  error={detailsError}
                  placeholder="Term 1 Literacy Baseline"
                  onChange={(event) => {
                    patchDetails({ title: event.target.value });
                  }}
                />

                <TextareaField
                  label="Description"
                  value={details.description}
                  rows={2}
                  hint="One line telling you at a glance what this covers."
                  onChange={(event) => {
                    patchDetails({ description: event.target.value });
                  }}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="Grade level"
                    value={String(details.grade_level)}
                    onChange={(event) => {
                      patchDetails({ grade_level: Number(event.target.value) });
                    }}
                    options={GRADES.map((grade) => ({
                      value: String(grade),
                      label: `Primary ${String(grade)}`,
                    }))}
                  />

                  <SelectField
                    label="Subject"
                    value={details.subject}
                    onChange={(event) => {
                      patchDetails({ subject: event.target.value as AssessmentSubject });
                    }}
                    options={SUBJECTS.map((subject) => ({
                      value: subject,
                      label: SUBJECT_LABEL[subject],
                    }))}
                  />

                  <SelectField
                    label="Assessment type"
                    value={details.assessment_type}
                    onChange={(event) => {
                      patchDetails({ assessment_type: event.target.value as AssessmentType });
                    }}
                    options={TYPES.map((type) => ({
                      value: type,
                      label: ASSESSMENT_TYPE_LABEL[type],
                    }))}
                  />

                  <SelectField
                    label="Difficulty"
                    value={details.difficulty}
                    onChange={(event) => {
                      patchDetails({ difficulty: event.target.value as Difficulty });
                    }}
                    options={DIFFICULTIES.map((difficulty) => ({
                      value: difficulty,
                      label: DIFFICULTY_LABEL[difficulty],
                    }))}
                  />

                  <TextField
                    label="Time limit (minutes)"
                    type="number"
                    min={0}
                    hint="0 means no limit."
                    value={details.time_limit_minutes}
                    onChange={(event) => {
                      patchDetails({ time_limit_minutes: Number(event.target.value) || 0 });
                    }}
                  />
                </div>

                <TextareaField
                  label="Instructions for the child (optional)"
                  value={details.instructions}
                  hint="Shown once, before the first question."
                  onChange={(event) => {
                    patchDetails({ instructions: event.target.value });
                  }}
                />
              </div>
            </Card>
          )}

          {step === 'questions' && (
            <>
              {draft.questions.length === 0 ? (
                <Card>
                  <div className="py-8 text-center">
                    <span className="bg-koyi-surface text-koyi-muted mx-auto flex size-12 items-center justify-center rounded-full">
                      <ClipboardIcon aria-hidden="true" className="size-6" />
                    </span>
                    <h2 className="text-koyi-text font-display mt-4 text-lg font-bold">
                      No questions yet
                    </h2>
                    <p className="text-koyi-muted mx-auto mt-2 max-w-sm text-sm">
                      Write one from scratch, or pull a ready-made question out of the bank.
                    </p>
                  </div>
                </Card>
              ) : (
                <ol ref={questionsRef} className="space-y-4">
                  {draft.questions.map((question, index) => (
                    <QuestionEditor
                      key={question.id}
                      index={index}
                      total={draft.questions.length}
                      question={question}
                      layouts={layouts.data ?? []}
                      error={errors[question.id]}
                      onChange={(next) => {
                        patchQuestion(question.id, next);
                      }}
                      onMove={(direction) => {
                        moveQuestion(index, direction);
                      }}
                      onDuplicate={() => {
                        setDraft((current) => ({
                          ...current,
                          questions: [
                            ...current.questions.slice(0, index + 1),
                            duplicateQuestion(question),
                            ...current.questions.slice(index + 1),
                          ],
                        }));
                      }}
                      onRemove={() => {
                        setDraft((current) => ({
                          ...current,
                          questions: current.questions.filter((item) => item.id !== question.id),
                        }));
                      }}
                    />
                  ))}
                </ol>
              )}

              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={addQuestion}>
                  <PlusIcon aria-hidden="true" className="size-4" />
                  Add question here
                </Button>

                <Button variant="secondary" onClick={openBank}>
                  <LayersIcon aria-hidden="true" className="size-4" />
                  Add from question bank
                </Button>
              </div>
            </>
          )}
        </div>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <Card title="Summary">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-koyi-muted text-xs font-semibold uppercase">Title</dt>
                <dd className="text-koyi-text mt-0.5 font-semibold">
                  {details.title || 'Untitled assessment'}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-koyi-muted">Subject</dt>
                <dd className="text-koyi-text font-semibold">{SUBJECT_LABEL[details.subject]}</dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-koyi-muted">Grade</dt>
                <dd className="text-koyi-text font-semibold">Primary {details.grade_level}</dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-koyi-muted">Questions</dt>
                <dd className="text-koyi-text font-semibold">{draft.questions.length}</dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-koyi-muted">Total points</dt>
                <dd className="text-koyi-text font-semibold">{totalPoints}</dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-koyi-muted">Time limit</dt>
                <dd className="text-koyi-text font-semibold">
                  {details.time_limit_minutes > 0
                    ? `${String(details.time_limit_minutes)} min`
                    : 'None'}
                </dd>
              </div>
            </dl>

            {draft.questions.length > 0 && (
              <ul className="border-koyi-border mt-4 space-y-1.5 border-t pt-4 text-xs">
                {[...new Set(draft.questions.map((question) => question.question_type))].map(
                  (type) => (
                    <li key={type} className="text-koyi-muted flex justify-between">
                      <span>{QUESTION_TYPE_LABEL[type]}</span>
                      <span className="text-koyi-text font-semibold">
                        {
                          draft.questions.filter((question) => question.question_type === type)
                            .length
                        }
                      </span>
                    </li>
                  ),
                )}
              </ul>
            )}

            {errors.form && (
              <p role="alert" className="text-koyi-danger mt-4 text-sm font-semibold">
                {errors.form}
              </p>
            )}

            {Object.keys(errors).length > 0 && !errors.form && (
              <p role="alert" className="text-koyi-danger mt-4 text-sm font-semibold">
                Fix the highlighted questions before you carry on.
              </p>
            )}

            {create.isError && (
              <p role="alert" className="text-koyi-danger mt-4 text-sm font-semibold">
                Could not save the assessment. Check your connection and try again.
              </p>
            )}

            <div className="mt-5 space-y-3">
              {step === 'details' ? (
                <Button className="w-full" onClick={goToQuestions}>
                  Next: questions
                </Button>
              ) : (
                <>
                  <Button className="w-full" onClick={goToAssign} disabled={create.isPending}>
                    {create.isPending ? 'Saving…' : 'Next: assign'}
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled
                    title="Preview opens once the child-facing player is ready."
                  >
                    Preview
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setStep('details');
                    }}
                  >
                    Back to details
                  </Button>
                </>
              )}
            </div>

            {step === 'questions' && (
              <p className="text-koyi-muted mt-3 text-xs">
                Preview shows the assessment the way a child sees it. It is not ready yet.
              </p>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
