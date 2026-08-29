import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  TrendingUpIcon,
} from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { StatBar } from '@/components/ui/stat-bar';
import { paths } from '@/config/paths';
import {
  BAND_BAR_CLASS,
  BAND_CHIP_CLASS,
  BAND_LABEL,
  formatChange,
  SUBJECT_LABEL,
} from '@/features/teacher/api/format';
import { DataTable } from '@/features/teacher/components/data-table';
import { StatCard } from '@/features/teacher/components/stat-card';
import type { TrendPoint } from '@/features/teacher/dashboard/api/dashboard.schema';
import { classPerformanceQuery } from '@/features/teacher/dashboard/api/queries';
import { cn } from '@/lib/utils/cn';

const SKILL_COLUMNS = [
  { key: 'skill', label: 'Skill area' },
  { key: 'average', label: 'Class average', align: 'right' as const },
  { key: 'change', label: 'Change', align: 'right' as const },
  { key: 'below', label: 'Below benchmark', align: 'right' as const },
];

/** Green when a figure moved up, red when it moved down, grey when it held. */
function changeClass(change: number): string {
  if (change > 0) return 'text-koyi-band-strong-ink';
  if (change < 0) return 'text-koyi-band-struggling-ink';
  return 'text-koyi-muted';
}

/**
 * The term's checkpoints as a column chart.
 *
 * Hand-drawn from the numbers the API returned rather than pulled from a chart
 * library: five bars need no dependency, and the table underneath carries the
 * same values for anyone who cannot see the bars.
 */
function TrendChart({ points }: { points: TrendPoint[] }) {
  return (
    <div>
      <ol className="flex h-48 items-end gap-3" aria-hidden="true">
        {points.map((point) => (
          <li key={point.id} className="flex h-full flex-1 flex-col justify-end gap-2">
            <p className="text-koyi-text text-center text-xs font-bold">{point.average_score}%</p>
            <div
              className="bg-koyi-primary/85 hover:bg-koyi-primary w-full rounded-t-md transition-colors"
              style={{ height: `${String(point.average_score)}%` }}
            />
          </li>
        ))}
      </ol>

      <ol className="mt-3 flex gap-3">
        {points.map((point) => (
          <li key={point.id} className="text-koyi-muted flex-1 text-center text-xs">
            {point.label}
          </li>
        ))}
      </ol>

      <table className="sr-only">
        <caption>Class average and participation at each checkpoint this term</caption>
        <thead>
          <tr>
            <th scope="col">Checkpoint</th>
            <th scope="col">Class average</th>
            <th scope="col">Participation</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.id}>
              <th scope="row">{point.label}</th>
              <td>{point.average_score}%</td>
              <td>{point.participation_rate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The full class report, opened from the dashboard's distribution card.
 *
 * What the dashboard card shows is where the class stands today. This screen
 * answers the question that follows — whether that is better or worse than it
 * was — so every figure here is paired with its movement since the baseline.
 * Nothing is averaged, banded or compared in the browser; the API sends both
 * the value and the change.
 */
export function ClassPerformancePage() {
  const performance = useQuery(classPerformanceQuery());

  return (
    <div className="space-y-6">
      <Link
        to={paths.teacher.dashboard}
        className="text-koyi-muted hover:text-koyi-text inline-flex items-center gap-1.5 text-sm font-semibold"
      >
        <ArrowLeftIcon aria-hidden="true" className="size-4" />
        Back to dashboard
      </Link>

      {performance.isPending && <PageSpinner />}

      {performance.isError && (
        <ErrorState
          error={performance.error}
          onRetry={() => {
            void performance.refetch();
          }}
        />
      )}

      {performance.data && (
        <>
          <PageHeader
            title="Class performance"
            subtitle={`${performance.data.class_name} · ${performance.data.term_label} · measured against ${performance.data.baseline_label}`}
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Class average"
              value={`${String(performance.data.class_average)}%`}
              caption={`${formatChange(performance.data.class_average_change)} points since ${performance.data.baseline_label}`}
              direction={
                performance.data.class_average_change > 0
                  ? 'up'
                  : performance.data.class_average_change < 0
                    ? 'down'
                    : 'flat'
              }
              Icon={TrendingUpIcon}
            />
            <StatCard
              label="Participation"
              value={`${String(performance.data.participation_rate)}%`}
              caption={`${String(performance.data.assessed_count)} of ${String(performance.data.total_students)} children assessed`}
              Icon={CheckCircleIcon}
              chipClassName="bg-koyi-band-strong-soft text-koyi-band-strong-ink"
            />
            <StatCard
              label="Not yet assessed"
              value={performance.data.total_students - performance.data.assessed_count}
              caption="Children with no result this term"
              Icon={AlertCircleIcon}
              chipClassName="bg-koyi-band-struggling-soft text-koyi-band-struggling-ink"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card
              title="Where the class sits now"
              subtitle={`Movement since ${performance.data.baseline_label}`}
              className="lg:col-span-2"
            >
              <div className="space-y-5">
                {performance.data.movement.map((band) => (
                  <div key={band.band}>
                    <StatBar
                      label={band.label}
                      valueLabel={`${String(band.students)} students · ${String(band.percentage)}%`}
                      percentage={band.percentage}
                      toneClassName={BAND_BAR_CLASS[band.band]}
                    />
                    <p className={cn('mt-1 text-xs font-semibold', changeClass(band.change))}>
                      {formatChange(band.change)} children since the baseline
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Term trend" subtitle="Class average at each checkpoint">
              <TrendChart points={performance.data.trend} />
            </Card>
          </div>

          <Card
            title="Performance by skill area"
            subtitle="Sorted by where the class needs the most support"
          >
            <DataTable
              caption="Each skill area with the class average, its change since the baseline and how many children sit below the benchmark"
              columns={SKILL_COLUMNS}
              minWidthClassName="min-w-160"
            >
              {performance.data.skills.map((skill) => (
                <tr key={skill.id}>
                  <td className="px-5 py-4">
                    <p className="text-koyi-text font-bold">{skill.skill}</p>
                    <p className="text-koyi-muted text-xs">{SUBJECT_LABEL[skill.subject]}</p>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div
                        aria-hidden="true"
                        className="bg-koyi-surface h-2 w-24 overflow-hidden rounded-full"
                      >
                        <div
                          className="bg-koyi-primary h-full rounded-full"
                          style={{ width: `${String(skill.average_score)}%` }}
                        />
                      </div>
                      <span className="text-koyi-text w-10 font-bold">{skill.average_score}%</span>
                    </div>
                  </td>

                  <td className={cn('px-5 py-4 text-right font-bold', changeClass(skill.change))}>
                    {formatChange(skill.change)}
                  </td>

                  <td className="text-koyi-text px-5 py-4 text-right">
                    {skill.students_below_benchmark}
                  </td>
                </tr>
              ))}
            </DataTable>
          </Card>

          {performance.data.most_improved.length > 0 && (
            <Card
              title="Most improved"
              subtitle={`Children who moved up a level since ${performance.data.baseline_label}`}
            >
              <ul className="grid gap-3 sm:grid-cols-2">
                {performance.data.most_improved.map((student) => (
                  <li key={student.student_id}>
                    <Link
                      to={paths.teacher.students.detail(student.student_id)}
                      className="border-koyi-border hover:border-koyi-primary hover:bg-koyi-surface flex items-center gap-3 rounded-md border p-3 transition-colors"
                    >
                      <InitialsAvatar name={student.full_name} />

                      <div className="min-w-0 flex-1">
                        <p className="text-koyi-text truncate font-bold">{student.full_name}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 font-semibold',
                              BAND_CHIP_CLASS[student.from_band],
                            )}
                          >
                            {BAND_LABEL[student.from_band]}
                          </span>
                          <ArrowRightIcon aria-hidden="true" className="text-koyi-muted size-3" />
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 font-semibold',
                              BAND_CHIP_CLASS[student.to_band],
                            )}
                          >
                            {BAND_LABEL[student.to_band]}
                          </span>
                        </p>
                      </div>

                      <span
                        className={cn('shrink-0 text-sm font-bold', changeClass(student.change))}
                      >
                        {formatChange(student.change)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
