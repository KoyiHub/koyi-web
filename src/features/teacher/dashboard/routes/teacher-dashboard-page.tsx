import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { buttonClasses } from '@/components/ui/button-variants';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClipboardIcon,
  HistoryIcon,
  MoreIcon,
  PlayIcon,
  PlusIcon,
  SparklesIcon,
  UsersIcon,
} from '@/components/ui/icons';
import { PageSpinner } from '@/components/ui/page-spinner';
import { StatBar } from '@/components/ui/stat-bar';
import { paths } from '@/config/paths';
import {
  BAND_BAR_CLASS,
  PRIORITY_CHIP_CLASS,
  PRIORITY_LABEL,
  SUBJECT_LABEL,
} from '@/features/teacher/api/format';
import { teacherProfileQuery } from '@/features/teacher/api/queries';
import { DataTable } from '@/features/teacher/components/data-table';
import { StatCard } from '@/features/teacher/components/stat-card';
import { teacherDashboardQuery } from '@/features/teacher/dashboard/api/queries';
import { cn } from '@/lib/utils/cn';

const GREETING: Record<'morning' | 'afternoon' | 'evening', string> = {
  morning: 'Good morning',
  afternoon: 'Good afternoon',
  evening: 'Good evening',
};

const ATTENTION_COLUMNS = [
  { key: 'student', label: 'Student' },
  { key: 'priority', label: 'Priority' },
  { key: 'issue', label: 'Identified issue' },
  { key: 'action', label: 'Recommended action' },
  { key: 'open', label: 'Open profile', align: 'right' as const, labelHidden: true },
];

/**
 * The Teacher landing screen.
 *
 * Every card is a doorway: the distribution opens the class report, the
 * insight opens the full insight list, the attention table opens the full
 * attention list. Nothing on this page is a dead end except the one quick
 * action that is deliberately not wired up yet.
 *
 * No figure here is computed in the browser — counts, percentages, bands and
 * movement captions all arrive from the API already decided.
 */
export function TeacherDashboardPage() {
  const profile = useQuery(teacherProfileQuery());
  const dashboard = useQuery(teacherDashboardQuery());

  const teacherName = profile.data ? `${profile.data.title} ${profile.data.short_name}` : 'there';

  return (
    <div className="space-y-6">
      {dashboard.isPending && <PageSpinner />}

      {dashboard.isError && (
        <ErrorState
          error={dashboard.error}
          onRetry={() => {
            void dashboard.refetch();
          }}
        />
      )}

      {dashboard.data && (
        <>
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-koyi-text font-display lg:text-koyi-page-title text-3xl leading-tight font-extrabold tracking-tight text-balance">
                {GREETING[dashboard.data.time_of_day]}, {teacherName}{' '}
                <span aria-hidden="true">👋</span>
              </h1>
              <p className="text-koyi-muted mt-2 text-sm">
                Here is where {dashboard.data.class_name} stands today · {dashboard.data.term_label}
              </p>
            </div>

            <Link
              to={paths.teacher.assessments.create}
              className={cn(buttonClasses('primary'), 'shrink-0')}
            >
              <PlusIcon aria-hidden="true" className="size-4" />
              Create assessment
            </Link>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Total students"
              value={dashboard.data.stats.total_students.value}
              caption={dashboard.data.stats.total_students.delta_label}
              direction={dashboard.data.stats.total_students.delta_direction}
              Icon={UsersIcon}
            />
            <StatCard
              label="Assessed this term"
              value={dashboard.data.stats.assessed.value}
              caption={dashboard.data.stats.assessed.delta_label}
              direction={dashboard.data.stats.assessed.delta_direction}
              Icon={CheckCircleIcon}
              chipClassName="bg-koyi-band-strong-soft text-koyi-band-strong-ink"
            />
            <StatCard
              label="Needing attention"
              value={dashboard.data.stats.needs_attention.value}
              caption={dashboard.data.stats.needs_attention.delta_label}
              direction={dashboard.data.stats.needs_attention.delta_direction}
              Icon={AlertCircleIcon}
              chipClassName="bg-koyi-band-struggling-soft text-koyi-band-struggling-ink"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card
              title="Class distribution"
              subtitle={`${String(dashboard.data.distribution.assessed_count)} children assessed · ${dashboard.data.distribution.updated_label}`}
              className="lg:col-span-2"
              action={
                <Link
                  to={paths.teacher.insights.classPerformance}
                  aria-label="Open the full class performance report"
                  className="text-koyi-muted hover:bg-koyi-surface hover:text-koyi-text flex size-9 items-center justify-center rounded-md transition-colors"
                >
                  <MoreIcon />
                </Link>
              }
            >
              <div className="space-y-5">
                {dashboard.data.distribution.segments.map((segment) => (
                  <StatBar
                    key={segment.band}
                    label={segment.label}
                    valueLabel={`${String(segment.students)} students · ${String(segment.percentage)}%`}
                    percentage={segment.percentage}
                    toneClassName={BAND_BAR_CLASS[segment.band]}
                  />
                ))}
              </div>

              <Link
                to={paths.teacher.insights.classPerformance}
                className="text-koyi-primary mt-6 inline-flex items-center gap-1.5 text-sm font-bold hover:underline"
              >
                See the full class report
                <ArrowRightIcon aria-hidden="true" className="size-4" />
              </Link>
            </Card>

            <div className="space-y-4">
              <section className="rounded-koyi-xl from-koyi-primary to-koyi-accent bg-gradient-to-br p-5 text-white">
                <div className="flex items-center gap-2">
                  <SparklesIcon aria-hidden="true" className="size-5" />
                  <h2 className="font-display text-base font-bold">AI insights</h2>
                </div>

                <p className="mt-4 text-sm leading-relaxed font-bold">
                  {dashboard.data.ai_insight.headline}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/85">
                  {dashboard.data.ai_insight.body}
                </p>

                <p className="mt-4 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  {dashboard.data.ai_insight.focus_skill} ·{' '}
                  {dashboard.data.ai_insight.affected_students} children
                </p>

                <Link
                  to={paths.teacher.insights.aiInsights}
                  className="text-koyi-primary mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white text-sm font-bold transition-colors hover:bg-white/90"
                >
                  View lesson plan
                  <ArrowRightIcon aria-hidden="true" className="size-4" />
                </Link>
              </section>

              <Card title="Quick actions">
                <ul className="space-y-3">
                  <li>
                    {/*
                      Deliberately inert for now: the live one-to-one assessment
                      flow is reached from the topbar, and this card's own
                      destination is not decided yet. Rendered disabled rather
                      than as a link that goes nowhere, so it never lies about
                      being clickable.
                    */}
                    <button
                      type="button"
                      disabled
                      className="border-koyi-border flex w-full items-center gap-3 rounded-md border p-3 text-left opacity-60"
                    >
                      <span
                        aria-hidden="true"
                        className="bg-koyi-nav-active text-koyi-primary flex size-9 shrink-0 items-center justify-center rounded-full"
                      >
                        <PlayIcon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-koyi-text block text-sm font-bold">
                          Start assessment
                        </span>
                        <span className="text-koyi-muted block text-xs">Coming soon</span>
                      </span>
                    </button>
                  </li>

                  <li>
                    <Link
                      to={paths.teacher.assessments.create}
                      className="border-koyi-border hover:border-koyi-primary hover:bg-koyi-surface flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors"
                    >
                      <span
                        aria-hidden="true"
                        className="bg-koyi-nav-active text-koyi-primary flex size-9 shrink-0 items-center justify-center rounded-full"
                      >
                        <ClipboardIcon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-koyi-text block text-sm font-bold">
                          Create assessment
                        </span>
                        <span className="text-koyi-muted block text-xs">
                          Build one from scratch or the bank
                        </span>
                      </span>
                      <ArrowRightIcon aria-hidden="true" className="text-koyi-muted size-4" />
                    </Link>
                  </li>

                  <li>
                    <Link
                      to={paths.teacher.insights.recentActivity}
                      className="border-koyi-border hover:border-koyi-primary hover:bg-koyi-surface flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors"
                    >
                      <span
                        aria-hidden="true"
                        className="bg-koyi-nav-active text-koyi-primary flex size-9 shrink-0 items-center justify-center rounded-full"
                      >
                        <HistoryIcon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-koyi-text block text-sm font-bold">
                          Recent activity
                        </span>
                        <span className="text-koyi-muted block text-xs">
                          Everything that happened in this class
                        </span>
                      </span>
                      <ArrowRightIcon aria-hidden="true" className="text-koyi-muted size-4" />
                    </Link>
                  </li>
                </ul>
              </Card>
            </div>
          </div>

          <Card
            title="Students needing attention"
            subtitle={`${String(dashboard.data.attention.total)} children flagged from the latest results`}
            action={
              <Link
                to={paths.teacher.insights.attention}
                className="text-koyi-primary inline-flex items-center gap-1.5 text-sm font-bold hover:underline"
              >
                View all
                <ArrowRightIcon aria-hidden="true" className="size-4" />
              </Link>
            }
          >
            <DataTable
              caption="The children this class is flagging, with the action the report suggests"
              columns={ATTENTION_COLUMNS}
              minWidthClassName="min-w-200"
            >
              {dashboard.data.attention.rows.map((row) => (
                <tr key={row.student_id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={row.full_name} />
                      <div className="min-w-0">
                        <p className="text-koyi-text truncate font-bold">{row.full_name}</p>
                        <p className="text-koyi-muted text-xs">{row.student_code}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
                        PRIORITY_CHIP_CLASS[row.priority],
                      )}
                    >
                      {PRIORITY_LABEL[row.priority]}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-koyi-text">{row.identified_issue}</p>
                    <p className="text-koyi-muted text-xs">{SUBJECT_LABEL[row.subject]}</p>
                  </td>

                  <td className="text-koyi-text max-w-72 px-5 py-4">{row.recommended_action}</td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      to={paths.teacher.students.detail(row.student_id)}
                      className="border-koyi-primary text-koyi-primary hover:bg-koyi-nav-active inline-flex h-9 items-center rounded-md border px-3 text-xs font-bold transition-colors"
                    >
                      View profile
                      <span className="sr-only"> for {row.full_name}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </DataTable>
          </Card>
        </>
      )}
    </div>
  );
}
