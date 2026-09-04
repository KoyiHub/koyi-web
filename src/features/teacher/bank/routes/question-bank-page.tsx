import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ImageIcon, LayersIcon, MicIcon, PlusIcon, VideoIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { paths } from '@/config/paths';
import {
  BANK_STATUS_CHIP_CLASS,
  BANK_STATUS_LABEL,
  DIFFICULTY_CHIP_CLASS,
  DIFFICULTY_LABEL,
  LAYOUT_LABEL,
  QUESTION_TYPE_LABEL,
  SUBJECT_LABEL,
} from '@/features/teacher/api/format';
import {
  type DraftQuestion,
  emptyDraft,
  readDraft,
  writeDraft,
} from '@/features/teacher/assessments/lib/draft';
import { questionBankQuery, questionBankSummaryQuery } from '@/features/teacher/bank/api/queries';
import type { BankQuestion } from '@/features/teacher/bank/api/question-bank.schema';
import { toDraftQuestion } from '@/features/teacher/bank/lib/to-draft-question';
import { cn } from '@/lib/utils/cn';

const MEDIA_ICON = { image: ImageIcon, audio: MicIcon, video: VideoIcon };

/**
 * What the question actually puts in front of a child, in its stored order.
 *
 * A bank card that shows only a title is a card you cannot judge: two
 * questions with the same wording can be a reading exercise and a listening
 * one. So the blocks are rendered, media included, and the options underneath
 * — without which is correct, which the bank never sends.
 */
function QuestionPreview({ question }: { question: BankQuestion }) {
  return (
    <div className="mt-3 space-y-2">
      {question.contents.map((content) => {
        if (content.type === 'text') {
          return (
            <p key={content.id} className="text-koyi-muted line-clamp-2 text-sm leading-relaxed">
              {content.text_content}
            </p>
          );
        }

        const Icon = MEDIA_ICON[content.type];
        const caption = content.caption ?? content.alt_text ?? content.media?.file_name ?? '';

        return (
          <p
            key={content.id}
            className="text-koyi-muted bg-koyi-surface inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold"
          >
            <Icon aria-hidden="true" className="size-3.5 shrink-0" />
            <span className="truncate">{caption || content.type}</span>
          </p>
        );
      })}

      {question.options.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 pt-1">
          {question.options.map((option) => {
            const Icon =
              option.type === 'text' || option.type === 'true_false'
                ? null
                : MEDIA_ICON[option.type];

            return (
              <li
                key={option.id}
                className="border-koyi-border text-koyi-muted inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
              >
                {Icon && <Icon aria-hidden="true" className="size-3.5" />}
                {option.value}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** One filter group in the rail. Each row is a count as well as a control. */
function FilterGroup({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value: string;
  options: { value: string; label: string; count?: number }[];
  onChange: (next: string) => void;
}) {
  return (
    <div>
      <h3 className="text-koyi-muted text-xs font-bold uppercase">{title}</h3>
      <ul className="mt-2 space-y-0.5">
        {options.map((option) => {
          const active = option.value === value;

          return (
            <li key={option.value}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => {
                  onChange(option.value);
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors',
                  active
                    ? 'bg-koyi-nav-active text-koyi-primary font-bold'
                    : 'text-koyi-muted hover:bg-koyi-surface hover:text-koyi-text',
                )}
              >
                <span className="truncate">{option.label}</span>
                {option.count !== undefined && (
                  <span className="shrink-0 text-xs font-semibold">{option.count}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * The question bank.
 *
 * It exists to be borrowed from, so selection is the primary action and the
 * card is built to be judged at a glance: type, layout, level, skill, and the
 * blocks themselves. There is no "start assessment" here — the bank is a
 * library of parts, and running an assessment with a child is a different job
 * on a different screen.
 */
export function QuestionBankPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('all');
  const [questionType, setQuestionType] = useState('all');
  const [level, setLevel] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<DraftQuestion[]>([]);

  const list = useQuery(questionBankQuery({ search, subject, questionType, level, page }));
  const summary = useQuery(questionBankSummaryQuery());

  // A draft in progress means the teacher arrived from the builder and is
  // shopping; without one they are browsing, and selecting starts a new
  // assessment rather than being a dead end.
  const [returningToBuilder] = useState(() => readDraft() !== null);

  const selectedIds = new Set(selected.map((question) => question.id));

  const toggle = (question: BankQuestion) => {
    setSelected((current) =>
      current.some((item) => item.id === question.id)
        ? current.filter((item) => item.id !== question.id)
        : [...current, toDraftQuestion(question)],
    );
  };

  const addToAssessment = () => {
    const draft = readDraft() ?? emptyDraft();
    const existing = new Set(draft.questions.map((question) => question.id));

    writeDraft({
      ...draft,
      questions: [...draft.questions, ...selected.filter((question) => !existing.has(question.id))],
    });

    void navigate(paths.teacher.assessments.create);
  };

  const resetPage = () => {
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Question bank"
        subtitle="Ready-made questions you can drop straight into an assessment."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {returningToBuilder && (
              <Button
                variant="ghost"
                onClick={() => {
                  void navigate(paths.teacher.assessments.create);
                }}
              >
                Back to builder
              </Button>
            )}

            <Button onClick={addToAssessment} disabled={selected.length === 0}>
              <PlusIcon aria-hidden="true" className="size-4" />
              Add {selected.length > 0 ? `${String(selected.length)} ` : ''}to assessment
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card bodyClassName="space-y-5">
            <div className="space-y-5">
              <div>
                <p className="text-koyi-text font-display text-2xl font-extrabold">
                  {summary.data?.total ?? '—'}
                </p>
                <p className="text-koyi-muted text-xs">
                  questions · {summary.data?.production_ready ?? '—'} ready for use
                </p>
              </div>

              <FilterGroup
                title="Subject"
                value={subject}
                onChange={(next) => {
                  setSubject(next);
                  resetPage();
                }}
                options={[
                  { value: 'all', label: 'Every subject' },
                  ...(summary.data?.by_subject ?? []).map((row) => ({
                    value: row.subject,
                    label: row.label,
                    count: row.count,
                  })),
                ]}
              />

              <FilterGroup
                title="Question type"
                value={questionType}
                onChange={(next) => {
                  setQuestionType(next);
                  resetPage();
                }}
                options={[
                  { value: 'all', label: 'Every type' },
                  ...(summary.data?.by_question_type ?? []).map((row) => ({
                    value: row.question_type,
                    label: row.label,
                    count: row.count,
                  })),
                ]}
              />

              <FilterGroup
                title="Level"
                value={level}
                onChange={(next) => {
                  setLevel(next);
                  resetPage();
                }}
                options={[
                  { value: 'all', label: 'Every level' },
                  ...(summary.data?.by_level ?? []).map((row) => ({
                    value: String(row.level),
                    label: row.label,
                    count: row.count,
                  })),
                ]}
              />
            </div>
          </Card>
        </aside>

        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SearchInput
              label="Search questions"
              placeholder="Search by wording, skill or reference"
              value={search}
              onChange={(next) => {
                setSearch(next);
                resetPage();
              }}
              className="w-full sm:w-80"
            />

            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelected([]);
                }}
                className="text-koyi-primary text-sm font-bold hover:underline"
              >
                Clear {selected.length} selected
              </button>
            )}
          </div>

          {list.isPending && <PageSpinner />}

          {list.isError && (
            <ErrorState
              error={list.error}
              onRetry={() => {
                void list.refetch();
              }}
            />
          )}

          {list.data?.results.length === 0 && (
            <EmptyState
              icon={<LayersIcon className="size-6" />}
              title="No questions match"
              description="Widen the filters, or write the question yourself in the builder."
            />
          )}

          {list.data && list.data.results.length > 0 && (
            <>
              <ul className="grid gap-4 xl:grid-cols-2">
                {list.data.results.map((question) => {
                  const checked = selectedIds.has(question.id);

                  return (
                    <li key={question.id}>
                      <label
                        className={cn(
                          'rounded-koyi-xl bg-koyi-card flex h-full cursor-pointer flex-col border p-5 transition-colors',
                          checked
                            ? 'border-koyi-primary ring-koyi-primary/20 ring-2'
                            : 'border-koyi-border hover:border-koyi-primary',
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              toggle(question);
                            }}
                            className="accent-koyi-primary mt-1 size-4 shrink-0"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-koyi-muted bg-koyi-surface rounded-full px-2.5 py-1 text-xs font-semibold">
                                {question.reference}
                              </span>
                              <span className="bg-koyi-nav-active text-koyi-primary rounded-full px-2.5 py-1 text-xs font-semibold">
                                {QUESTION_TYPE_LABEL[question.question_type]}
                              </span>
                              <span
                                className={cn(
                                  'rounded-full px-2.5 py-1 text-xs font-semibold',
                                  DIFFICULTY_CHIP_CLASS[question.difficulty],
                                )}
                              >
                                {DIFFICULTY_LABEL[question.difficulty]}
                              </span>
                              <span
                                className={cn(
                                  'ml-auto rounded-full px-2.5 py-1 text-xs font-semibold',
                                  BANK_STATUS_CHIP_CLASS[question.status],
                                )}
                              >
                                {BANK_STATUS_LABEL[question.status]}
                              </span>
                            </div>

                            <h3 className="text-koyi-text mt-3 text-sm font-bold text-balance">
                              {question.text}
                            </h3>

                            <QuestionPreview question={question} />
                          </div>
                        </div>

                        <div className="text-koyi-muted mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4 text-xs">
                          <span className="font-semibold">{SUBJECT_LABEL[question.subject]}</span>
                          <span aria-hidden="true">·</span>
                          <span>Primary {question.level}</span>
                          <span aria-hidden="true">·</span>
                          <span>{question.skill}</span>
                          {question.layout && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{LAYOUT_LABEL[question.layout]}</span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span>{question.point} pt</span>
                          <span className="ml-auto">
                            Used {question.usage_count}× · {question.updated_label}
                          </span>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>

              <Pagination
                page={list.data.page}
                pageCount={list.data.num_pages}
                onPageChange={setPage}
                totalCount={list.data.count}
                pageSize={list.data.page_size}
                itemLabel="questions"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
