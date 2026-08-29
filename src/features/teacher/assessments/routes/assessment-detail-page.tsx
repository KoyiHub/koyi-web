import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import {
  BarChartIcon,
  ClockIcon,
  DownloadIcon,
  FlagIcon,
  PrinterIcon,
  TargetIcon,
  UsersIcon,
} from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { SearchInput } from '@/components/ui/search-input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { StatBar } from '@/components/ui/stat-bar';
import { paths } from '@/config/paths';
import {
  ASSESSMENT_STATUS_CLASS,
  ASSESSMENT_STATUS_LABEL,
  ASSESSMENT_TYPE_LABEL,
  BAND_BAR_CLASS,
  BAND_CHIP_CLASS,
  BAND_LABEL,
  DIFFICULTY_CHIP_CLASS,
  DIFFICULTY_LABEL,
  formatChange,
  formatDate,
  SUBJECT_LABEL,
} from '@/features/teacher/api/format';
import type {
  AssessmentDetail,
  StudentResult,
} from '@/features/teacher/assessments/api/assessment.schema';
import { assessmentDetailQuery } from '@/features/teacher/assessments/api/queries';
import { DataTable } from '@/features/teacher/components/data-table';
import { StatCard } from '@/features/teacher/components/stat-card';
import { cn } from '@/lib/utils/cn';

type ResultFilter = 'all' | 'completed' | 'in_progress' | 'not_started';

const RESULT_FILTERS: { value: ResultFilter; label: string }[] = [
  { value: 'all', label: 'Everyone' },
  { value: 'completed', label: 'Completed' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'not_started', label: 'Not started' },
];

const RESULT_STATUS_LABEL: Record<StudentResult['status'], string> = {
  completed: 'Completed',
  in_progress: 'In progress',
  not_started: 'Not started',
};

const RESULT_STATUS_CLASS: Record<StudentResult['status'], string> = {
  completed: 'bg-koyi-band-strong-soft text-koyi-band-strong-ink',
  in_progress: 'bg-koyi-band-intermediate-soft text-koyi-band-intermediate-ink',
  not_started: 'bg-koyi-surface text-koyi-muted',
};

const COLUMNS = [
  { key: 'student', label: 'Student' },
  { key: 'status', label: 'Status' },
  { key: 'score', label: 'Score', align: 'right' as const },
  { key: 'correct', label: 'Correct' },
  { key: 'level', label: 'Learning level' },
  { key: 'time', label: 'Time taken' },
  { key: 'submitted', label: 'Submitted' },
];

const EXPORT_HEADERS = [
  'Student',
  'Student code',
  'Status',
  'Score (%)',
  'Correct',
  'Learning level',
  'Time taken',
  'Submitted',
];

/** Wraps a value so a comma or quote inside it cannot break the column. */
function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

/**
 * Exports the rows the teacher is currently looking at.
 *
 * Client-side and limited to what is on screen on purpose — this is a copy of
 * the visible table for a staff meeting, not a data extract, so it can never
 * release more than the page already showed.
 */
function exportResults(title: string, rows: StudentResult[]) {
  const lines = [
    EXPORT_HEADERS.map(csvCell).join(','),
    ...rows.map((row) =>
      [
        row.full_name,
        row.student_code,
        RESULT_STATUS_LABEL[row.status],
        row.score === null ? '' : String(row.score),
        row.correct_label ?? '',
        row.band ? BAND_LABEL[row.band] : '',
        row.time_taken_label ?? '',
        row.submitted_at ? formatDate(row.submitted_at) : '',
      ]
        .map(csvCell)
        .join(','),
    ),
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}-results.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

/** Small key/value pair in the header's fact strip. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-koyi-muted text-xs font-semibold uppercase">{label}</dt>
      <dd className="text-koyi-text mt-1 text-sm font-bold">{value}</dd>
    </div>
  );
}

function Chip({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={cn(
        'bg-koyi-surface text-koyi-muted rounded-full px-3 py-1 text-xs font-bold',
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Everything the teacher has to decide from, in one screen.
 *
 * Beyond the design's three cards and two panels, this adds the parts a
 * teacher asked to act on results actually needs: the children who have not
 * started yet (a completion rate alone hides them), what each learning level
 * means for the next lesson, and a filter over the results table so "who is
 * still outstanding" is one click rather than a scan.
 */
export function AssessmentDetailPage() {
  const { assessmentId = '' } = useParams();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<ResultFilter>('all');
  const [search, setSearch] = useState('');

  const detail = useQuery(assessmentDetailQuery(assessmentId));

  if (detail.isPending) return <PageSpinner />;

  if (detail.isError) {
    return (
      <ErrorState
        error={detail.error}
        onRetry={() => {
          void detail.refetch();
        }}
      />
    );
  }

  const assessment: AssessmentDetail = detail.data;
  const { metrics } = assessment;
  const notStarted = metrics.assigned_count - metrics.completed_count;

  const term = search.trim().toLowerCase();
  const rows = assessment.results.filter((row) => {
    if (filter !== 'all' && row.status !== filter) return false;
    if (!term) return true;
    return (
      row.full_name.toLowerCase().includes(term) || row.student_code.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={assessment.title}
        subtitle={assessment.description}
        actions={
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <Button
              variant="secondary"
              onClick={() => {
                exportResults(assessment.title, rows);
              }}
            >
              <DownloadIcon aria-hidden="true" className="size-4" />
              Export
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                window.print();
              }}
            >
              <PrinterIcon aria-hidden="true" className="size-4" />
              Print report
            </Button>

            <Button
              onClick={() => {
                void navigate(paths.teacher.assessments.analytics(assessment.id));
              }}
            >
              <BarChartIcon aria-hidden="true" className="size-4" />
              View analytics
            </Button>
          </div>
        }
      />

      <Card bodyClassName="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Chip className={ASSESSMENT_STATUS_CLASS[assessment.status]}>
            {ASSESSMENT_STATUS_LABEL[assessment.status]}
          </Chip>
          <Chip>{SUBJECT_LABEL[assessment.subject]}</Chip>
          <Chip>{ASSESSMENT_TYPE_LABEL[assessment.assessment_type]}</Chip>
          <Chip className={DIFFICULTY_CHIP_CLASS[assessment.difficulty]}>
            {DIFFICULTY_LABEL[assessment.difficulty]}
          </Chip>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 xl:grid-cols-6">
          <Fact label="Class" value={assessment.class_name} />
          <Fact label="Grade" value={assessment.grade_label} />
          <Fact label="Questions" value={String(assessment.question_count)} />
          <Fact label="Total points" value={String(assessment.total_points)} />
          <Fact
            label="Time limit"
            value={
              assessment.time_limit_minutes === null
                ? 'Untimed'
                : `${String(assessment.time_limit_minutes)} min`
            }
          />
          <Fact label="Window" value={assessment.window_label ?? 'Not scheduled'} />
        </dl>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Class average"
          value={`${String(metrics.class_average)}%`}
          caption={`${formatChange(metrics.class_average_change)} vs the last assessment`}
          direction={
            metrics.class_average_change > 0
              ? 'up'
              : metrics.class_average_change < 0
                ? 'down'
                : 'flat'
          }
          Icon={TargetIcon}
        />

        <StatCard
          label="Completion"
          value={`${String(metrics.completion_rate)}%`}
          caption={`${String(metrics.completed_count)} of ${String(metrics.assigned_count)} children submitted`}
          Icon={UsersIcon}
          chipClassName="bg-koyi-band-strong-soft text-koyi-band-strong-ink"
        />

        {/*
          The design stops at the completion rate. A teacher chasing a class
          needs the head count that is still outstanding, so it gets a card of
          its own rather than being buried in the caption above.
        */}
        <StatCard
          label="Yet to start"
          value={String(notStarted)}
          caption={notStarted === 0 ? 'Everyone has submitted' : 'Follow up before the deadline'}
          direction={notStarted === 0 ? 'up' : 'flat'}
          Icon={ClockIcon}
          chipClassName="bg-koyi-band-intermediate-soft text-koyi-band-intermediate-ink"
        />

        <StatCard
          label="Needs attention"
          value={String(metrics.needs_attention)}
          caption={`Average time ${metrics.average_time_label}`}
          Icon={FlagIcon}
          chipClassName="bg-koyi-band-struggling-soft text-koyi-band-struggling-ink"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card
          title="Performance by skill area"
          subtitle="Where the class is strong, and where the next lesson has work to do."
        >
          <ul className="space-y-4">
            {assessment.skills.map((skill) => (
              <li key={skill.id}>
                <StatBar
                  label={skill.skill}
                  valueLabel={`${String(skill.average_score)}%`}
                  percentage={skill.average_score}
                />
                <p className="text-koyi-muted mt-1.5 text-xs">
                  {skill.students_below_benchmark === 0
                    ? 'Every child is at or above the benchmark.'
                    : `${String(skill.students_below_benchmark)} ${
                        skill.students_below_benchmark === 1 ? 'child is' : 'children are'
                      } below the benchmark.`}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="Learning levels"
          subtitle="What each group needs from you next."
          bodyClassName="space-y-3"
        >
          {assessment.learning_levels.map((level) => (
            <div key={level.band} className="border-koyi-border rounded-koyi-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-bold',
                    BAND_CHIP_CLASS[level.band],
                  )}
                >
                  {level.label}
                </span>
                <span className="text-koyi-text text-sm font-bold">
                  {level.students} {level.students === 1 ? 'child' : 'children'} ·{' '}
                  {level.percentage}%
                </span>
              </div>

              <div
                role="img"
                aria-label={`${level.label}: ${String(level.percentage)}%`}
                className="bg-koyi-surface mt-3 h-2 w-full overflow-hidden rounded-full"
              >
                <div
                  className={cn('h-full rounded-full', BAND_BAR_CLASS[level.band])}
                  style={{ width: `${String(level.percentage)}%` }}
                />
              </div>

              {/*
                The band alone tells a teacher nothing they can teach from, so
                the server sends the guidance line with it.
              */}
              <p className="text-koyi-muted mt-3 text-sm leading-relaxed">{level.guidance}</p>
            </div>
          ))}
        </Card>
      </div>

      <Card
        title="Student results"
        subtitle={`${String(rows.length)} of ${String(assessment.results.length)} children shown`}
        action={
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <SearchInput
              label="Search results"
              placeholder="Search by name or code"
              value={search}
              onChange={setSearch}
              className="w-full sm:w-56"
            />
            <SegmentedControl
              label="Filter results by status"
              value={filter}
              options={RESULT_FILTERS}
              onChange={setFilter}
            />
          </div>
        }
        bodyClassName="pt-2"
      >
        {rows.length === 0 ? (
          <EmptyState
            title="No children match"
            description="Clear the search or choose a different status."
          />
        ) : (
          <DataTable caption={`Results for ${assessment.title}`} columns={COLUMNS}>
            {rows.map((row) => (
              <tr key={row.student_id} className="hover:bg-koyi-surface/60">
                <td className="px-5 py-3">
                  <Link
                    to={paths.teacher.students.detail(row.student_id)}
                    className="focus-visible:outline-koyi-primary flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <InitialsAvatar name={row.full_name} />
                    <span className="min-w-0">
                      <span className="text-koyi-text block truncate font-bold">
                        {row.full_name}
                      </span>
                      <span className="text-koyi-muted block text-xs">{row.student_code}</span>
                    </span>
                  </Link>
                </td>

                <td className="px-5 py-3">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-semibold',
                      RESULT_STATUS_CLASS[row.status],
                    )}
                  >
                    {RESULT_STATUS_LABEL[row.status]}
                  </span>
                </td>

                <td className="text-koyi-text px-5 py-3 text-right font-bold">
                  {row.score === null ? '—' : `${String(row.score)}%`}
                </td>

                <td className="text-koyi-muted px-5 py-3">{row.correct_label ?? '—'}</td>

                <td className="px-5 py-3">
                  {row.band ? (
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-semibold',
                        BAND_CHIP_CLASS[row.band],
                      )}
                    >
                      {BAND_LABEL[row.band]}
                    </span>
                  ) : (
                    <span className="text-koyi-muted">—</span>
                  )}
                </td>

                <td className="text-koyi-muted px-5 py-3">{row.time_taken_label ?? '—'}</td>

                <td className="text-koyi-muted px-5 py-3">
                  {row.submitted_at ? formatDate(row.submitted_at) : '—'}
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </Card>
    </div>
  );
}
