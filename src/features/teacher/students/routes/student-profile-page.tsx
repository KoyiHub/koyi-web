import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { BookOpenIcon, CalculatorIcon, SparklesIcon, TargetIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { StatBar } from '@/components/ui/stat-bar';
import { paths } from '@/config/paths';
import {
  BAND_BAR_CLASS,
  BAND_CHIP_CLASS,
  formatChange,
  LEVEL_CHIP_CLASS,
  QUESTION_TYPE_LABEL,
  SUBJECT_LABEL,
} from '@/features/teacher/api/format';
import { DataTable } from '@/features/teacher/components/data-table';
import { learningProfileQuery } from '@/features/teacher/students/api/queries';
import type {
  QuestionLogEntry,
  SubjectBreakdown,
} from '@/features/teacher/students/api/student.schema';
import { cn } from '@/lib/utils/cn';

type Outcome = QuestionLogEntry['outcome'];
type LogFilter = 'all' | Outcome;
type Urgency = 'now' | 'this_week' | 'this_term';

const SUBJECT_ICON = { literacy: BookOpenIcon, numeracy: CalculatorIcon };

const OUTCOME_LABEL: Record<Outcome, string> = {
  correct: 'Correct',
  incorrect: 'Incorrect',
  partial: 'Partly correct',
  skipped: 'Skipped',
};

const OUTCOME_CLASS: Record<Outcome, string> = {
  correct: 'bg-koyi-band-strong-soft text-koyi-band-strong-ink',
  incorrect: 'bg-koyi-band-struggling-soft text-koyi-band-struggling-ink',
  partial: 'bg-koyi-band-intermediate-soft text-koyi-band-intermediate-ink',
  skipped: 'bg-koyi-surface text-koyi-muted',
};

const LOG_FILTERS: { value: LogFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'incorrect', label: 'Incorrect' },
  { value: 'partial', label: 'Partly' },
  { value: 'skipped', label: 'Skipped' },
];

const URGENCY_LABEL: Record<Urgency, string> = {
  now: 'Start now',
  this_week: 'This week',
  this_term: 'This term',
};

const URGENCY_CLASS: Record<Urgency, string> = {
  now: 'bg-koyi-band-struggling-soft text-koyi-band-struggling-ink',
  this_week: 'bg-koyi-band-intermediate-soft text-koyi-band-intermediate-ink',
  this_term: 'bg-koyi-surface text-koyi-muted',
};

const CONFIDENCE_LABEL = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence — treat as a hint',
};

const LOG_COLUMNS = [
  { key: 'question', label: 'Question' },
  { key: 'response', label: 'What the child answered' },
  { key: 'outcome', label: 'Outcome' },
  { key: 'points', label: 'Points', align: 'right' as const },
  { key: 'time', label: 'Time' },
];

/** One subject panel: the overall figure, then the skills underneath it. */
function SubjectPanel({ breakdown }: { breakdown: SubjectBreakdown }) {
  const Icon = SUBJECT_ICON[breakdown.subject];

  return (
    <Card bodyClassName="space-y-4">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="bg-koyi-nav-active text-koyi-primary grid size-10 shrink-0 place-items-center rounded-full"
        >
          <Icon className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-koyi-text font-bold">{breakdown.label}</h2>
          <span
            className={cn(
              'mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold',
              BAND_CHIP_CLASS[breakdown.band],
            )}
          >
            {breakdown.band_label}
          </span>
        </div>

        <p className="text-koyi-text font-display text-2xl font-extrabold">
          {breakdown.overall_score}%
        </p>
      </div>

      <ul className="space-y-4">
        {breakdown.skills.map((skill) => (
          <li key={skill.id}>
            <StatBar
              label={skill.skill}
              valueLabel={`${String(skill.score)}%`}
              percentage={skill.score}
              toneClassName={BAND_BAR_CLASS[skill.band]}
            />
            <p className="text-koyi-muted mt-1.5 flex items-center gap-2 text-xs">
              <span
                className={cn(
                  'font-semibold',
                  skill.change > 0
                    ? 'text-koyi-band-strong-ink'
                    : skill.change < 0
                      ? 'text-koyi-band-struggling-ink'
                      : 'text-koyi-muted',
                )}
              >
                {formatChange(skill.change)} pts
              </span>
              <span>{skill.band_label}</span>
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/**
 * One child's learning profile.
 *
 * The screen is ordered the way a teacher reads it: where the child is, what
 * the report thinks is going on, what to do about it, and only then the raw
 * evidence. The question log shows what the child answered and how the server
 * graded it — never the expected answer, because the child's own assessment
 * app runs in this same browser.
 */
export function StudentProfilePage() {
  const { studentId = '' } = useParams();
  const [logFilter, setLogFilter] = useState<LogFilter>('all');

  const profile = useQuery(learningProfileQuery(studentId));

  if (profile.isPending) return <PageSpinner />;

  if (profile.isError) {
    return (
      <ErrorState
        error={profile.error}
        onRetry={() => {
          void profile.refetch();
        }}
      />
    );
  }

  const student = profile.data;
  const log = student.question_log.filter(
    (entry) => logFilter === 'all' || entry.outcome === logFilter,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={student.full_name}
        subtitle={`${student.student_code} · ${student.class_name} · ${String(student.age)} years old`}
      />

      <Card bodyClassName="flex flex-wrap items-center gap-5">
        <InitialsAvatar name={student.full_name} className="size-16 text-lg" />

        <div className="min-w-0 flex-1">
          <span
            className={cn(
              'inline-block rounded-full px-3 py-1 text-xs font-bold',
              LEVEL_CHIP_CLASS[student.level],
            )}
          >
            {student.level_label}
          </span>

          <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
            <div>
              <dt className="text-koyi-muted text-xs font-semibold uppercase">Overall</dt>
              <dd className="text-koyi-text text-sm font-bold">
                {student.overall_score}%{' '}
                <span
                  className={cn(
                    'text-xs',
                    student.overall_change > 0
                      ? 'text-koyi-band-strong-ink'
                      : student.overall_change < 0
                        ? 'text-koyi-band-struggling-ink'
                        : 'text-koyi-muted',
                  )}
                >
                  ({formatChange(student.overall_change)})
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-koyi-muted text-xs font-semibold uppercase">Assessments</dt>
              <dd className="text-koyi-text text-sm font-bold">{student.assessments_taken}</dd>
            </div>
            <div>
              <dt className="text-koyi-muted text-xs font-semibold uppercase">Last assessed</dt>
              <dd className="text-koyi-text text-sm font-bold">{student.last_assessed_label}</dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-koyi-band-strong-ink text-xs font-bold uppercase">Strengths</p>
            <ul className="text-koyi-muted mt-1.5 space-y-1 text-sm">
              {student.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-koyi-band-struggling-ink text-xs font-bold uppercase">
              Learning gaps
            </p>
            <ul className="text-koyi-muted mt-1.5 space-y-1 text-sm">
              {student.learning_gaps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        {student.breakdown.map((breakdown) => (
          <SubjectPanel key={breakdown.subject} breakdown={breakdown} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card
          title="AI interpretation"
          subtitle={`Generated ${student.interpretation.generated_label}`}
          icon={<SparklesIcon className="size-5" />}
          bodyClassName="space-y-4"
        >
          <p className="text-koyi-text text-sm leading-relaxed">{student.interpretation.summary}</p>

          <div>
            <p className="text-koyi-muted text-xs font-bold uppercase">What this is based on</p>
            <ul className="text-koyi-muted mt-2 space-y-1.5 text-sm">
              {student.interpretation.evidence.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-koyi-primary">
                    •
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/*
            A teacher acting on this needs to know how much weight it carries.
            The confidence comes from the server with the narrative; the client
            only names it.
          */}
          <p className="text-koyi-muted border-koyi-border border-t pt-3 text-xs font-semibold">
            {CONFIDENCE_LABEL[student.interpretation.confidence]}
          </p>
        </Card>

        <Card
          title="Recommended next steps"
          icon={<TargetIcon className="size-5" />}
          bodyClassName="space-y-3"
        >
          {student.next_steps.map((step) => (
            <div key={step.id} className="border-koyi-border rounded-koyi-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-bold',
                    URGENCY_CLASS[step.urgency],
                  )}
                >
                  {URGENCY_LABEL[step.urgency]}
                </span>
                <span className="text-koyi-muted text-xs font-semibold">{step.skill}</span>
              </div>
              <h3 className="text-koyi-text mt-2 text-sm font-bold">{step.title}</h3>
              <p className="text-koyi-muted mt-1 text-sm leading-relaxed">{step.detail}</p>
            </div>
          ))}
        </Card>
      </div>

      <Card title="Assessment history" subtitle="Every completed assessment, most recent first.">
        <ul className="space-y-3">
          {student.history.map((entry) => (
            <li key={entry.id} className="flex items-center gap-4">
              <div className="w-40 shrink-0">
                <p className="text-koyi-text truncate text-sm font-bold">{entry.label}</p>
                <p className="text-koyi-muted text-xs">{entry.date_label}</p>
              </div>

              <div
                role="img"
                aria-label={`${entry.label}: ${String(entry.score)}%`}
                className="bg-koyi-surface h-2.5 flex-1 overflow-hidden rounded-full"
              >
                <div
                  className={cn('h-full rounded-full', BAND_BAR_CLASS[entry.band])}
                  style={{ width: `${String(entry.score)}%` }}
                />
              </div>

              <span className="text-koyi-text w-12 shrink-0 text-right text-sm font-bold">
                {entry.score}%
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card
        title="Question log"
        subtitle="What the child actually did, question by question."
        action={
          <SegmentedControl
            label="Filter the question log by outcome"
            value={logFilter}
            options={LOG_FILTERS}
            onChange={setLogFilter}
          />
        }
        bodyClassName="pt-2"
      >
        {log.length === 0 ? (
          <EmptyState
            title="Nothing in this group"
            description="No answered question matches that outcome."
          />
        ) : (
          <DataTable caption={`Question log for ${student.full_name}`} columns={LOG_COLUMNS}>
            {log.map((entry) => (
              <tr key={entry.id} className="hover:bg-koyi-surface/60">
                <td className="max-w-80 px-5 py-3">
                  <p className="text-koyi-text font-semibold text-balance">{entry.question_text}</p>
                  <p className="text-koyi-muted mt-1 text-xs">
                    <Link
                      to={paths.teacher.assessments.detail(entry.assessment_id)}
                      className="hover:text-koyi-primary hover:underline"
                    >
                      {entry.assessment_title}
                    </Link>{' '}
                    · {SUBJECT_LABEL[entry.subject]} · {entry.skill} ·{' '}
                    {QUESTION_TYPE_LABEL[entry.question_type]}
                  </p>
                </td>

                <td className="text-koyi-muted max-w-64 px-5 py-3">{entry.response}</td>

                <td className="px-5 py-3">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-semibold',
                      OUTCOME_CLASS[entry.outcome],
                    )}
                  >
                    {OUTCOME_LABEL[entry.outcome]}
                  </span>
                </td>

                <td className="text-koyi-text px-5 py-3 text-right font-bold">
                  {entry.points_awarded}/{entry.points_possible}
                </td>

                <td className="text-koyi-muted px-5 py-3">{entry.time_taken_label}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </Card>
    </div>
  );
}
