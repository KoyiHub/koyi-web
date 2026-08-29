import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { buttonClasses } from '@/components/ui/button-variants';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ClipboardIcon, UsersIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { TextField } from '@/components/ui/text-field';
import { paths } from '@/config/paths';
import { LEVEL_CHIP_CLASS, LEVEL_LABEL, SUBJECT_LABEL } from '@/features/teacher/api/format';
import { useAssignAssessment } from '@/features/teacher/assessments/api/mutations';
import { clearDraft, readDraft } from '@/features/teacher/assessments/lib/draft';
import { studentListQuery } from '@/features/teacher/students/api/queries';
import { cn } from '@/lib/utils/cn';

const LEVEL_TABS = [
  { value: 'all', label: 'Everyone' },
  { value: 'strong', label: 'Strong' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'struggling', label: 'Struggling' },
  { value: 'beginner', label: 'Not yet assessed' },
] as const;

/** `datetime-local` gives `YYYY-MM-DDTHH:mm`; the API wants a real ISO string. */
function toIso(value: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/**
 * Step 3 of the builder: when it opens, when it closes, and who sits it.
 *
 * The assessment already exists at this point — step 2 saved it as a draft —
 * so this screen only schedules it. That split means a teacher interrupted
 * here has not lost the questions, and nothing reaches a child until Assign
 * is pressed.
 */
export function AssignAssessmentPage() {
  const navigate = useNavigate();
  const assign = useAssignAssessment();

  // Read once: the builder is finished writing by the time this screen opens.
  const [draft] = useState(() => readDraft());

  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [startsAt, setStartsAt] = useState('');
  const [deadline, setDeadline] = useState('');
  const [timeLimit, setTimeLimit] = useState(String(draft?.details.time_limit_minutes ?? 30));
  const [formError, setFormError] = useState<string>();

  // Ids and names together, so the summary can name children who are on a page
  // the teacher has since paged away from.
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const focus = draft?.focus;
    return focus ? Object.fromEntries(focus.student_ids.map((id) => [id, ''])) : {};
  });

  const students = useQuery(studentListQuery({ search, level, page }));
  const selectedIds = Object.keys(selected);

  if (!draft?.created_id) {
    return (
      <div className="space-y-6">
        <PageHeader title="Assign assessment" />
        <EmptyState
          icon={<ClipboardIcon className="size-6" />}
          title="There is nothing to assign yet"
          description="Build an assessment first, then come back here to schedule it."
          action={
            <Link to={paths.teacher.assessments.create} className={buttonClasses('primary')}>
              Create assessment
            </Link>
          }
        />
      </div>
    );
  }

  const assessmentId = draft.created_id;
  const totalPoints = draft.questions.reduce((sum, question) => sum + question.point, 0);

  const toggle = (id: string, name: string) => {
    setSelected((current) => {
      if (id in current) {
        const { [id]: _removed, ...rest } = current;
        return rest;
      }
      return { ...current, [id]: name };
    });
  };

  const rows = students.data?.results ?? [];
  const pageIds = rows.map((student) => student.id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => id in selected);

  const togglePage = () => {
    setSelected((current) => {
      if (allOnPageSelected) {
        const next = { ...current };
        for (const id of pageIds) delete next[id];
        return next;
      }

      const next = { ...current };
      for (const student of rows) next[student.id] = student.full_name;
      return next;
    });
  };

  const submit = (saveAsDraft: boolean) => {
    if (selectedIds.length === 0) {
      setFormError('Pick at least one child.');
      return;
    }

    const startIso = toIso(startsAt);
    const deadlineIso = toIso(deadline);

    if (!saveAsDraft && !startIso) {
      setFormError('Set a start date and time, or save this as a draft instead.');
      return;
    }

    if (startIso && deadlineIso && deadlineIso <= startIso) {
      setFormError('The deadline has to be after the start.');
      return;
    }

    setFormError(undefined);

    assign.mutate(
      {
        assessmentId,
        studentIds: selectedIds,
        startsAt: startIso,
        deadline: deadlineIso,
        timeLimitMinutes: Number(timeLimit) || null,
        saveAsDraft,
      },
      {
        onSuccess: (result) => {
          clearDraft();
          void navigate(paths.teacher.assessments.detail(result.id));
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assign assessment"
        subtitle={draft.details.title || 'Untitled assessment'}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <Card
            title="Assignment parameters"
            subtitle="When it opens for the children, and how long they get."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField
                label="Start date & time"
                type="datetime-local"
                value={startsAt}
                onChange={(event) => {
                  setStartsAt(event.target.value);
                }}
              />

              <TextField
                label="Deadline"
                type="datetime-local"
                value={deadline}
                hint="Optional — leave blank to keep it open."
                onChange={(event) => {
                  setDeadline(event.target.value);
                }}
              />

              <TextField
                label="Time limit (minutes)"
                type="number"
                min={0}
                value={timeLimit}
                hint="0 means no limit."
                onChange={(event) => {
                  setTimeLimit(event.target.value);
                }}
              />
            </div>
          </Card>

          <Card
            title="Select students"
            subtitle={`${String(selectedIds.length)} selected`}
            action={
              <SearchInput
                label="Search students"
                value={search}
                onChange={(next) => {
                  setSearch(next);
                  setPage(1);
                }}
              />
            }
          >
            {draft.focus && (
              <p className="bg-koyi-nav-active text-koyi-primary rounded-koyi-md mb-4 px-3 py-2.5 text-sm font-semibold">
                Pre-selected from your {draft.focus.skill} focus group. Change it however you like.
              </p>
            )}

            <div className="mb-4 flex flex-wrap gap-2">
              {LEVEL_TABS.map((tab) => {
                const count = students.data?.level_counts[tab.value];
                const active = level === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setLevel(tab.value);
                      setPage(1);
                    }}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                      active
                        ? 'bg-koyi-primary text-white'
                        : 'bg-koyi-surface text-koyi-muted hover:text-koyi-text',
                    )}
                  >
                    {tab.label}
                    {count !== undefined && ` (${String(count)})`}
                  </button>
                );
              })}
            </div>

            {students.isPending && <PageSpinner />}

            {students.isError && (
              <ErrorState
                error={students.error}
                onRetry={() => {
                  void students.refetch();
                }}
              />
            )}

            {students.data && rows.length === 0 && (
              <EmptyState
                icon={<UsersIcon className="size-6" />}
                title="No children match"
                description="Try a different level, or clear the search."
              />
            )}

            {students.data && rows.length > 0 && (
              <>
                <label className="border-koyi-border text-koyi-text flex items-center gap-3 border-b pb-3 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={togglePage}
                    className="accent-koyi-primary size-4"
                  />
                  Select everyone on this page
                </label>

                <ul className="divide-koyi-border divide-y">
                  {rows.map((student) => {
                    const checked = student.id in selected;

                    return (
                      <li key={student.id}>
                        <label
                          className={cn(
                            'flex cursor-pointer flex-wrap items-center gap-3 px-1 py-3 transition-colors',
                            checked ? 'bg-koyi-nav-active/40' : 'hover:bg-koyi-surface/60',
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              toggle(student.id, student.full_name);
                            }}
                            className="accent-koyi-primary size-4"
                          />

                          <InitialsAvatar name={student.full_name} className="size-9" />

                          <div className="min-w-0 flex-1">
                            <p className="text-koyi-text truncate text-sm font-semibold">
                              {student.full_name}
                            </p>
                            <p className="text-koyi-muted text-xs">
                              {student.student_code} · {student.class_name}
                            </p>
                          </div>

                          <span
                            className={cn(
                              'rounded-full px-2.5 py-1 text-xs font-semibold',
                              LEVEL_CHIP_CLASS[student.level],
                            )}
                          >
                            {LEVEL_LABEL[student.level]}
                          </span>

                          <span className="text-koyi-muted w-32 text-right text-xs">
                            {student.last_assessed_label}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>

                <Pagination
                  page={students.data.page}
                  pageCount={students.data.num_pages}
                  onPageChange={setPage}
                  totalCount={students.data.count}
                  pageSize={students.data.page_size}
                  itemLabel="students"
                  className="mt-4"
                />
              </>
            )}
          </Card>
        </div>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-koyi-xl from-koyi-primary to-koyi-accent bg-gradient-to-br p-5 text-white">
            <h2 className="font-display text-base font-bold">Summary</h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold text-white/70 uppercase">Assessment</dt>
                <dd className="mt-0.5 font-semibold">
                  {draft.details.title || 'Untitled assessment'}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-white/80">Subject</dt>
                <dd className="font-semibold">{SUBJECT_LABEL[draft.details.subject]}</dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-white/80">Questions</dt>
                <dd className="font-semibold">{draft.questions.length}</dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-white/80">Total points</dt>
                <dd className="font-semibold">{totalPoints}</dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-white/80">Students</dt>
                <dd className="font-semibold">{selectedIds.length}</dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-white/80">Time limit</dt>
                <dd className="font-semibold">
                  {Number(timeLimit) > 0 ? `${timeLimit} min` : 'None'}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-white/80">Opens</dt>
                <dd className="font-semibold">
                  {startsAt ? new Date(startsAt).toLocaleString() : 'Not set'}
                </dd>
              </div>
            </dl>

            {formError && (
              <p
                role="alert"
                className="mt-4 rounded-md bg-white/15 px-3 py-2 text-sm font-semibold"
              >
                {formError}
              </p>
            )}

            {assign.isError && (
              <p
                role="alert"
                className="mt-4 rounded-md bg-white/15 px-3 py-2 text-sm font-semibold"
              >
                Could not schedule this. Check your connection and try again.
              </p>
            )}

            <div className="mt-5 space-y-3">
              <button
                type="button"
                disabled={assign.isPending}
                onClick={() => {
                  submit(false);
                }}
                className="text-koyi-primary focus-visible:outline-koyi-primary h-11 w-full rounded-full bg-white text-sm font-bold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
              >
                {assign.isPending ? 'Working…' : 'Assign assessment'}
              </button>

              <button
                type="button"
                disabled={assign.isPending}
                onClick={() => {
                  submit(true);
                }}
                className="h-11 w-full rounded-full border border-white/50 text-sm font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-60"
              >
                Save as draft
              </button>
            </div>

            <p className="mt-3 text-xs text-white/70">
              Saving as a draft keeps your choices without opening it for anyone.
            </p>
          </section>

          <Button
            variant="ghost"
            className="mt-3 w-full"
            onClick={() => {
              void navigate(paths.teacher.assessments.create);
            }}
          >
            Back to questions
          </Button>
        </aside>
      </div>
    </div>
  );
}
