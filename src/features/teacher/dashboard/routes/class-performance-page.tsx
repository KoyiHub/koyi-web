import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, UsersIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { StatBar } from '@/components/ui/stat-bar';
import { paths } from '@/config/paths';
import { DataTable } from '@/features/teacher/components/data-table';
import { StatCard } from '@/features/teacher/components/stat-card';
import { classPerformanceQuery } from '@/features/teacher/dashboard/api/queries';
import { DOMAIN_LABEL, levelDistributionRows, levelLabel } from '@/lib/fln/level';

const DOMAINS = ['literacy', 'numeracy'] as const;

/**
 * The full class report, opened from the dashboard's distribution card.
 *
 * No doc anchor exists for this endpoint (flagged in `refactor-plan.md`), but
 * the page still has to obey §9 like everything else: no bare percentage, no
 * strong/weak band, no term framing, and literacy/numeracy never collapse
 * into one figure. Rebuilt on the same level-distribution + movement
 * vocabulary the real school overview and student skills endpoints use.
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
            subtitle={`${performance.data.class_name} · ${performance.data.measured_since}`}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Total students"
              value={performance.data.total_students}
              Icon={UsersIcon}
            />
            <StatCard
              label="Assessed"
              value={performance.data.assessed_count}
              Icon={CheckCircleIcon}
              chipClassName="bg-koyi-band-strong-soft text-koyi-band-strong-ink"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {DOMAINS.map((domain) => {
              const rows = levelDistributionRows(
                performance.data.level_distribution.levels[domain],
              );
              const max = Math.max(1, ...rows.map((row) => row.students));
              const movement = performance.data.movement.find((entry) => entry.domain === domain);

              return (
                <Card key={domain} title={`${DOMAIN_LABEL[domain]} — level distribution`}>
                  <div className="space-y-3">
                    {rows.map((row) => (
                      <StatBar
                        key={row.level}
                        label={levelLabel(row.level)}
                        valueLabel={`${String(row.students)} ${row.students === 1 ? 'child' : 'children'}`}
                        percentage={(row.students / max) * 100}
                      />
                    ))}
                  </div>

                  <p className="text-koyi-muted mt-4 text-xs">
                    {performance.data.level_distribution.unplaced[domain]}{' '}
                    {performance.data.level_distribution.unplaced[domain] === 1
                      ? 'child has'
                      : 'children have'}{' '}
                    not been reached by an assessment yet.
                  </p>

                  {movement && (
                    <p className="text-koyi-muted border-koyi-border mt-3 border-t pt-3 text-xs">
                      Since the last check: {movement.moved_up} moved up a level,{' '}
                      {movement.moved_down} moved down, {movement.unchanged} unchanged,{' '}
                      {movement.newly_placed} placed for the first time.
                    </p>
                  )}
                </Card>
              );
            })}
          </div>

          {performance.data.skills.length > 0 && (
            <Card
              title="Skill × level matrix"
              subtitle="How the class spreads across each skill's levels — not an average."
            >
              <DataTable
                caption="Each skill's level spread across the class, and who needs it taught next"
                columns={[
                  { key: 'skill', label: 'Skill' },
                  { key: 'levels', label: 'Level spread' },
                  { key: 'support', label: 'Needs this next', align: 'right' as const },
                ]}
                minWidthClassName="min-w-160"
              >
                {performance.data.skills.map((skill) => (
                  <tr key={skill.id}>
                    <td className="px-5 py-4">
                      <p className="text-koyi-text font-bold">{skill.skill}</p>
                      <p className="text-koyi-muted text-xs">{DOMAIN_LABEL[skill.domain]}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(skill.levels)
                          .sort(([a], [b]) => Number(a) - Number(b))
                          .map(([level, count]) => (
                            <span
                              key={level}
                              className="bg-koyi-surface text-koyi-text rounded-full px-2.5 py-1 text-xs font-medium"
                            >
                              L{level}: {count}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="text-koyi-text px-5 py-4 text-right font-bold">
                      {skill.students_needing_support}
                    </td>
                  </tr>
                ))}
              </DataTable>
            </Card>
          )}

          {performance.data.most_improved.length > 0 && (
            <Card
              title="Moved up a level"
              subtitle={`Since the last check — ${performance.data.measured_since}`}
            >
              <ul className="grid gap-3 sm:grid-cols-2">
                {performance.data.most_improved.map((student) => (
                  <li key={`${student.student_id}-${student.domain}`}>
                    <Link
                      to={paths.teacher.students.detail(student.student_id)}
                      className="border-koyi-border hover:border-koyi-primary hover:bg-koyi-surface flex items-center gap-3 rounded-md border p-3 transition-colors"
                    >
                      <InitialsAvatar name={student.full_name} />

                      <div className="min-w-0 flex-1">
                        <p className="text-koyi-text truncate font-bold">{student.full_name}</p>
                        <p className="text-koyi-muted mt-1 text-xs">
                          {DOMAIN_LABEL[student.domain]}:{' '}
                          {student.previous !== null
                            ? `Level ${String(student.previous)} → `
                            : 'Not yet placed → '}
                          Level {student.current}
                        </p>
                      </div>

                      <ArrowRightIcon
                        aria-hidden="true"
                        className="text-koyi-muted size-4 shrink-0"
                      />
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
