import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { CheckCircleIcon, ClipboardIcon, PlusIcon } from '@/components/ui/icons';
import { Modal } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { TextField } from '@/components/ui/text-field';
import { TextareaField } from '@/components/ui/textarea-field';
import { paths } from '@/config/paths';
import {
  useCreateAssessment,
  usePublishAssessment,
  useReplaceSectionQuestions,
  useUpdateAssessment,
} from '@/features/teacher/assessments/api/mutations';
import {
  assessmentQuery,
  coverageQuery,
  sectionQuestionsQuery,
  sectionsQuery,
} from '@/features/teacher/assessments/api/queries';
import { BankPicker } from '@/features/teacher/assessments/components/bank-picker';
import { CoveragePanel } from '@/features/teacher/assessments/components/coverage-panel';
import { QuestionFormPanel } from '@/features/teacher/assessments/components/question-form-panel';
import { SectionEditor } from '@/features/teacher/assessments/components/section-editor';
import {
  draftToAuthoredQuestion,
  emptyQuestionDraft,
  isDraftValid,
  nextKey,
  type QuestionDraft,
  validateQuestionDraft,
} from '@/features/teacher/assessments/lib/question-form';
import { findSubskill } from '@/features/teacher/assessments/lib/subskill-lookup';
import type { BankQuestion } from '@/features/teacher/bank/api/bank.schema';
import { bankQuestionsQuery, skillsQuery } from '@/features/teacher/bank/api/queries';
import { ApiError } from '@/lib/api/errors';

/**
 * The assessment authoring workspace — `frontend-integration.md` §5.3, §7.4.
 *
 * A **draft workspace**, not a single form: the draft exists from step 1, and
 * every later step is a real request against that id. Nothing here is held
 * only in browser state until the teacher chooses to add it — the id itself
 * lives in the URL (`?assessmentId=`), so a refresh mid-build resumes rather
 * than restarts.
 *
 *   1. Details    — POST creates the draft
 *   2. Sections    — POST one per sitting
 *   3. Questions   — PUT replaces a section's whole array
 *   4. Coverage    — GET, shown live, not only before publishing
 *   5. Publish     — POST, one-way, mints the code
 */

const STEPS = ['Details', 'Sections', 'Questions', 'Coverage', 'Publish'] as const;
type Step = (typeof STEPS)[number];

export function CreateAssessmentPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const assessmentId = searchParams.get('assessmentId');
  const [step, setStep] = useState<Step>(assessmentId ? 'Sections' : 'Details');
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const assessment = useQuery({
    ...assessmentQuery(assessmentId ?? ''),
    enabled: Boolean(assessmentId),
  });

  function goToAssessment(id: string) {
    setSearchParams({ assessmentId: id });
    setStep('Sections');
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader
        title="Build an Assessment"
        subtitle="Sections, then questions, then a coverage check — the draft is saved after every step."
      />

      <ol className="flex flex-wrap gap-2 text-sm">
        {STEPS.map((label, index) => {
          const reachable = label === 'Details' || Boolean(assessmentId);
          return (
            <li key={label}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => {
                  setStep(label);
                }}
                className={`rounded-full px-3 py-1.5 font-medium ${
                  step === label
                    ? 'bg-koyi-primary text-white'
                    : reachable
                      ? 'bg-koyi-surface text-koyi-text hover:bg-koyi-nav-active'
                      : 'text-koyi-muted cursor-not-allowed opacity-50'
                }`}
              >
                {index + 1}. {label}
              </button>
            </li>
          );
        })}
      </ol>

      {step === 'Details' && (
        <DetailsStep
          assessmentId={assessmentId}
          existing={assessment.data}
          onSaved={goToAssessment}
        />
      )}

      {step === 'Sections' && assessmentId && (
        <SectionsStep
          assessmentId={assessmentId}
          activeSectionId={activeSectionId}
          onSelectSection={(id) => {
            setActiveSectionId(id);
            setStep('Questions');
          }}
        />
      )}

      {step === 'Questions' && assessmentId && activeSectionId && (
        <QuestionsStep assessmentId={assessmentId} sectionId={activeSectionId} />
      )}

      {step === 'Coverage' && assessmentId && <CoverageStep assessmentId={assessmentId} />}

      {step === 'Publish' && assessmentId && assessment.data && (
        <PublishStep assessmentId={assessmentId} assessment={assessment.data} />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 1 — Details                                                           */
/* -------------------------------------------------------------------------- */

function DetailsStep({
  assessmentId,
  existing,
  onSaved,
}: {
  assessmentId: string | null;
  existing: { name: string; instructions: string } | undefined;
  onSaved: (id: string) => void;
}) {
  const [name, setName] = useState(existing?.name ?? '');
  const [instructions, setInstructions] = useState(existing?.instructions ?? '');
  const create = useCreateAssessment();
  const update = useUpdateAssessment(assessmentId ?? '');

  // Adjusting state when a prop changes belongs in render, not an effect (the
  // React docs' "Adjusting state based on a prop change" pattern): resuming a
  // draft means `existing` arrives one tick after mount, once its query
  // settles, and this fills the form the moment it does — in exactly one extra
  // render, with no effect and no risk of a cascading one.
  const [seenName, setSeenName] = useState(existing?.name);
  if (existing && existing.name !== seenName) {
    setSeenName(existing.name);
    setName(existing.name);
    setInstructions(existing.instructions);
  }

  const pending = create.isPending || update.isPending;
  const error = create.error ?? update.error;

  async function handleNext() {
    if (assessmentId) {
      await update.mutateAsync({ name, instructions });
      onSaved(assessmentId);
      return;
    }
    const created = await create.mutateAsync({
      name,
      instructions,
      opens_at: null,
      closes_at: null,
    });
    onSaved(created.id);
  }

  return (
    <div className="border-koyi-border rounded-koyi-md space-y-4 border p-5">
      <TextField
        label="Name"
        placeholder="Term 1 baseline"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
        }}
      />
      <TextareaField
        label="Instructions"
        labelHidden
        placeholder="Instructions shown to the child before they start"
        rows={3}
        value={instructions}
        onChange={(event) => {
          setInstructions(event.target.value);
        }}
      />
      {error instanceof ApiError && <p className="text-koyi-danger text-sm">{error.message}</p>}
      <Button onClick={() => void handleNext()} isLoading={pending} disabled={!name.trim()}>
        {assessmentId ? 'Save and continue' : 'Create draft and continue'}
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 2 — Sections                                                          */
/* -------------------------------------------------------------------------- */

function SectionsStep({
  assessmentId,
  activeSectionId,
  onSelectSection,
}: {
  assessmentId: string;
  activeSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
}) {
  const sections = useQuery(sectionsQuery(assessmentId));
  const skills = useQuery(skillsQuery());

  if (sections.isPending || skills.isPending) return <PageSpinner />;

  return (
    <SectionEditor
      assessmentId={assessmentId}
      sections={sections.data ?? []}
      skills={skills.data ?? []}
      activeSectionId={activeSectionId}
      onSelectSection={onSelectSection}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Step 3 — Questions                                                         */
/* -------------------------------------------------------------------------- */

function QuestionsStep({ assessmentId, sectionId }: { assessmentId: string; sectionId: string }) {
  const sections = useQuery(sectionsQuery(assessmentId));
  const skills = useQuery(skillsQuery());
  const existingQuestions = useQuery(sectionQuestionsQuery(assessmentId, sectionId));
  const replace = useReplaceSectionQuestions(assessmentId, sectionId);

  const [drafts, setDrafts] = useState<QuestionDraft[] | null>(null);
  const [bankOpen, setBankOpen] = useState(false);
  const [bankFilters, setBankFilters] = useState<{
    skill?: string | undefined;
    search?: string | undefined;
  }>({});

  const section = sections.data?.find((candidate) => candidate.id === sectionId);
  const bankQuestions = useQuery({
    ...bankQuestionsQuery({ domain: section?.domain ?? undefined, ...bankFilters }),
    enabled: bankOpen && Boolean(section),
  });

  // Seed local drafts from the server once, the first time this section's
  // questions load. Adjusting state from freshly-arrived query data belongs in
  // render, not an effect (React's "Adjusting state based on a prop change"
  // pattern) — the guard below (`drafts === null`) makes this run exactly
  // once, the same tick both queries settle.
  if (drafts === null && existingQuestions.data && skills.data) {
    const skillsData = skills.data;
    setDrafts(
      existingQuestions.data.map((question) => {
        const resolved = findSubskill(skillsData, question.subskill_id);
        return {
          key: nextKey(),
          id: question.id,
          subskill_id: question.subskill_id,
          subskill_name: resolved?.subskill.name ?? 'Unknown subskill',
          level_range: resolved?.subskill.level_range ?? [question.fln_level, question.fln_level],
          fln_level: question.fln_level,
          question_type: question.question_type,
          layout: question.layout,
          text: question.text,
          description: question.description,
          point: question.point,
          source_question_id: question.source_question_id,
          contents: question.contents.map((content) => ({ ...content, key: nextKey() })),
          options: question.options.map((option) => ({ ...option, key: nextKey() })),
          answer_value: question.answer?.value ?? '',
        };
      }),
    );
  }

  if (!section || drafts === null) return <PageSpinner />;

  // Narrowed once, here: a function *declared* below does not keep the
  // narrowing TS just proved for `section`/`drafts`, since a closure could in
  // principle be called after either changes. Rebinding to a new const carries
  // the narrowed type into every closure that captures it instead.
  const activeSection = section;
  const savedDrafts = drafts;

  function save(next: QuestionDraft[]) {
    setDrafts(next);
    void replace.mutateAsync(next.map(draftToAuthoredQuestion));
  }

  function addBlank() {
    const first = skills.data?.find((skill) => skill.domain === activeSection.domain)?.subskills[0];
    if (!first) return;
    save([...savedDrafts, emptyQuestionDraft(first.id, first.name, first.level_range)]);
  }

  function addFromBank(question: BankQuestion) {
    save([
      ...savedDrafts,
      {
        key: nextKey(),
        subskill_id: question.subskill.id,
        subskill_name: question.subskill.name,
        level_range: question.subskill.level_range,
        fln_level: question.fln_level,
        question_type: question.type,
        layout: question.layout,
        text: question.content,
        description: '',
        point: '1.00',
        source_question_id: question.id,
        contents: question.contents.map((content) => ({
          type: content.type,
          display_order: content.display_order,
          text_content: content.text_content ?? null,
          media_id: content.media_id ?? null,
          caption: content.caption ?? null,
          key: nextKey(),
        })),
        options: question.options.map((option) => ({
          type: option.type,
          value: option.value,
          is_correct: option.is_correct,
          media_id: option.media_id ?? null,
          key: nextKey(),
        })),
        answer_value: '',
      },
    ]);
    setBankOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-koyi-text text-sm font-semibold">{activeSection.name}</p>
          <p className="text-koyi-muted text-xs">
            {savedDrafts.length} question{savedDrafts.length === 1 ? '' : 's'} saved
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setBankOpen((open) => !open);
            }}
          >
            {bankOpen ? 'Hide bank' : 'Use a bank question'}
          </Button>
          <Button size="sm" onClick={addBlank}>
            <PlusIcon className="size-4" />
            Write a question
          </Button>
        </div>
      </div>

      {bankOpen && (
        <BankPicker
          domain={section.domain}
          skills={skills.data ?? []}
          questions={bankQuestions.data?.results ?? []}
          isLoading={bankQuestions.isPending}
          onFilterChange={setBankFilters}
          onUse={addFromBank}
        />
      )}

      {replace.isError && (
        <p className="text-koyi-danger text-sm">
          {replace.error instanceof ApiError
            ? replace.error.message
            : 'Could not save this section.'}
        </p>
      )}

      {drafts.length === 0 ? (
        <p className="text-koyi-muted text-sm">
          No questions yet. Write one or use the bank above.
        </p>
      ) : (
        drafts.map((draft) => (
          <QuestionFormPanel
            key={draft.key}
            draft={draft}
            errors={validateQuestionDraft(draft)}
            onChange={(next) => {
              save(drafts.map((candidate) => (candidate.key === draft.key ? next : candidate)));
            }}
            onRemove={() => {
              save(drafts.filter((candidate) => candidate.key !== draft.key));
            }}
          />
        ))
      )}

      {drafts.length > 0 && !drafts.every(isDraftValid) && (
        <p className="text-koyi-warning text-sm">
          One or more questions above are incomplete. They save as entered, but coverage and publish
          will show why the paper isn't ready yet.
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 4 — Coverage                                                          */
/* -------------------------------------------------------------------------- */

function CoverageStep({ assessmentId }: { assessmentId: string }) {
  const coverage = useQuery(coverageQuery(assessmentId));
  if (coverage.isPending) return <PageSpinner />;
  if (!coverage.data) return null;
  return <CoveragePanel coverage={coverage.data} />;
}

/* -------------------------------------------------------------------------- */
/* Step 5 — Publish                                                           */
/* -------------------------------------------------------------------------- */

function PublishStep({
  assessmentId,
  assessment,
}: {
  assessmentId: string;
  assessment: { status: string; code: string };
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const publish = usePublishAssessment();

  if (assessment.status !== 'draft' && assessment.code) {
    return (
      <div className="border-koyi-border rounded-koyi-md space-y-4 border p-6 text-center">
        <CheckCircleIcon className="text-koyi-success mx-auto size-8" />
        <p className="text-koyi-text text-sm">
          Published. Children sit this paper with the code below — it cannot be edited or deleted
          now.
        </p>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(assessment.code).then(() => {
              setCopied(true);
            });
          }}
          className="border-koyi-border rounded-koyi-md mx-auto flex items-center gap-2 border-2 border-dashed px-6 py-4 text-3xl font-bold tracking-widest"
        >
          {assessment.code}
          <ClipboardIcon className="size-5" />
        </button>
        {copied && <p className="text-koyi-success text-xs">Copied</p>}
        <Link
          to={paths.teacher.assessments.assignFor(assessmentId)}
          className="text-koyi-primary block text-sm font-medium hover:underline"
        >
          Assign it to students →
        </Link>
      </div>
    );
  }

  return (
    <div className="border-koyi-border rounded-koyi-md space-y-4 border p-6">
      <p className="text-koyi-text text-sm">
        Publishing locks this paper. Children may sit it as soon as it's assigned, and it can no
        longer be edited or deleted.
      </p>
      {publish.isError && (
        <p className="text-koyi-danger text-sm">
          {publish.error instanceof ApiError
            ? publish.error.message
            : 'Could not publish — check every section has questions.'}
        </p>
      )}
      <Button
        onClick={() => {
          setConfirmOpen(true);
        }}
      >
        Publish
      </Button>

      <Modal
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
        }}
        title="Publish this assessment?"
        description="This cannot be undone. The paper cannot be edited or deleted once it is published."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setConfirmOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              isLoading={publish.isPending}
              onClick={() => {
                void publish.mutateAsync(assessmentId).then(() => {
                  setConfirmOpen(false);
                });
              }}
            >
              Publish
            </Button>
          </>
        }
      >
        <p className="text-koyi-muted text-sm">
          A six-character code is minted once this is confirmed.
        </p>
      </Modal>
    </div>
  );
}
