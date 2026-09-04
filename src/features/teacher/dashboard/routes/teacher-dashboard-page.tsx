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
import { BAND_BAR_CLASS, formatDate } from '@/features/teacher/api/format';
import { DataTable } from '@/features/teacher/components/data-table';
import { StatCard } from '@/features/teacher/components/stat-card';
import { teacherDashboardQuery } from '@/features/teacher/dashboard/api/queries';
import { DOMAIN_LABEL } from '@/lib/fln/level';

const ATTENTION_COLUMNS = [
  { key: 'student', label: 'Student' },
  { key: 'gap', label: 'Primary gap' },
  { key: 'assessed', label: 'Last assessed' },
  { key: 'open', label: 'Open profile', align: 'right' as const, labelHidden: true },
];

const DISTRIBUTION_BANDS = ['strong', 'intermediate', 'struggling', 'not_yet_assessed'] as const;

const DISTRIBUTION_LABEL: Record<(typeof DISTRIBUTION_BANDS)[number], string> = {
  strong: 'Strong',
  intermediate: 'Intermediate',
  struggling: 'Struggling',
  not_yet_assessed: 'Not yet assessed',
};

const DISTRIBUTION_BAR_CLASS: Record<(typeof DISTRIBUTION_BANDS)[number], string> = {
  strong: BAND_BAR_CLASS.strong,
  intermediate: BAND_BAR_CLASS.intermediate,
  struggling: BAND_BAR_CLASS.struggling,
  not_yet_assessed: 'bg-koyi-border',
};

/**
 * The Teacher landing screen — `frontend-integration.md` §5.1, one call.
 *
 * `class_distribution` is the **one place** literacy and numeracy collapse
 * into a single band per child (their weaker domain) — a declared exception
 * to §9, used nowhere else in this app. There is no trend arrow: the doc is
 * explicit that a mocked-up "12 ↑2%" was rejected rather than faked, since
 * nothing here stores a historical snapshot to diff against.
 */
export function TeacherDashboardPage() {
  const dashboard = useQuery(teacherDashboardQuery());

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
                Hello, {dashboard.data.teacher_name} <span aria-hidden="true">👋</span>
              </h1>
              <p className="text-koyi-muted mt-2 text-sm">
                {dashboard.data.school_class
                  ? `Here is where ${dashboard.data.school_class} stands today`
                  : 'No class assigned yet.'}
              </p>
            </div>

            <Link
              to={paths.teacher.assessments.create}
              className={buttonClasses('primary') + ' shrink-0'}
            >
              <PlusIcon aria-hidden="true" className="size-4" />
              Create assessment
            </Link>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Total students"
              value={dashboard.data.total_students}
              Icon={UsersIcon}
            />
            <StatCard
              label="Assessed"
              value={dashboard.data.assessed_students}
              Icon={CheckCircleIcon}
              chipClassName="bg-koyi-band-strong-soft text-koyi-band-strong-ink"
            />
            <StatCard
              label="Needing attention"
              value={dashboard.data.attention_count}
              Icon={AlertCircleIcon}
              chipClassName="bg-koyi-band-struggling-soft text-koyi-band-struggling-ink"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card
              title="Class distribution"
              subtitle={`${String(dashboard.data.assessed_students)} of ${String(dashboard.data.total_students)} children assessed`}
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
                {DISTRIBUTION_BANDS.map((band) => {
                  const students = dashboard.data.class_distribution[band];
                  const percentage =
                    dashboard.data.total_students > 0
                      ? (students / dashboard.data.total_students) * 100
                      : 0;

                  return (
                    <StatBar
                      key={band}
                      label={DISTRIBUTION_LABEL[band]}
                      valueLabel={`${String(students)} students · ${percentage.toFixed(0)}%`}
                      percentage={percentage}
                      toneClassName={DISTRIBUTION_BAR_CLASS[band]}
                    />
                  );
                })}
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
                  <h2 className="font-display text-base font-bold">Insight</h2>
                </div>

                {dashboard.data.insight ? (
                  <>
                    {(dashboard.data.insight.domain === 'literacy' ||
                      dashboard.data.insight.domain === 'numeracy') &&
                      dashboard.data.insight.skill_name && (
                        <p className="mt-4 text-sm leading-relaxed font-bold">
                          {DOMAIN_LABEL[dashboard.data.insight.domain]}:{' '}
                          {dashboard.data.insight.skill_name}
                        </p>
                      )}
                    <p className="mt-2 text-sm leading-relaxed text-white/85">
                      {dashboard.data.insight.summary}
                    </p>

                    {dashboard.data.insight.group_id && (
                      <Link
                        to={paths.teacher.students.groupDetail(dashboard.data.insight.group_id)}
                        className="text-koyi-primary mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white text-sm font-bold transition-colors hover:bg-white/90"
                      >
                        View lesson plan
                        <ArrowRightIcon aria-hidden="true" className="size-4" />
                      </Link>
                    )}
                  </>
                ) : (
                  <p className="mt-4 text-sm leading-relaxed text-white/85">
                    Nothing to flag yet — check back once more results are in.
                  </p>
                )}
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
            subtitle={`${String(dashboard.data.attention_count)} children flagged from the latest results`}
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
              caption="The children this class is flagging, with their primary gap"
              columns={ATTENTION_COLUMNS}
              minWidthClassName="min-w-160"
            >
              {dashboard.data.students_needing_attention.map((row) => (
                <tr key={row.student_id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={row.full_name} />
                      <p className="text-koyi-text truncate font-bold">{row.full_name}</p>
                    </div>
                  </td>

                  <td className="text-koyi-text px-5 py-4">{row.primary_gap}</td>

                  <td className="text-koyi-muted px-5 py-4 text-xs">
                    {formatDate(row.last_assessed_at)}
                  </td>

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
