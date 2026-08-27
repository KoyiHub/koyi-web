import { useQuery } from '@tanstack/react-query';
import { type ComponentType, type SVGProps, useState } from 'react';

import { LearningLevelChart } from '@/components/charts/learning-level-chart';
import { ProgressTrendChart } from '@/components/charts/progress-trend-chart';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { GraduationCapIcon, LayersIcon, TrendingUpIcon, UsersIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { SegmentedControl, UnderlineTabs } from '@/components/ui/segmented-control';
import {
  TERM_FILTER_LABEL,
  TERM_FILTERS,
  type TermFilter,
} from '@/features/school-admin/dashboard/api/dashboard.schema';
import { dashboardSummaryQuery } from '@/features/school-admin/dashboard/api/queries';
import { cn } from '@/lib/utils/cn';

const TERM_OPTIONS = TERM_FILTERS.map((term) => ({ value: term, label: TERM_FILTER_LABEL[term] }));

type LevelBreakdown = 'by_grade' | 'by_subject';

const BREAKDOWN_OPTIONS = [
  { value: 'by_grade' as const, label: 'By Grade' },
  { value: 'by_subject' as const, label: 'By Subject' },
];

interface StatCardProps {
  label: string;
  value: number;
  changePercentage: number | null;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Tailwind classes for the icon chip — each card carries its own tone. */
  chipClassName: string;
  trendClassName: string;
}

function StatCard({
  label,
  value,
  changePercentage,
  Icon,
  chipClassName,
  trendClassName,
}: StatCardProps) {
  return (
    <div className="rounded-koyi-xl border-koyi-border bg-koyi-card border p-5">
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden="true"
          className={cn('flex size-11 items-center justify-center rounded-full', chipClassName)}
        >
          <Icon className="size-5" />
        </span>

        {changePercentage !== null && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
              trendClassName,
            )}
          >
            <TrendingUpIcon className="size-3.5" aria-hidden="true" />
            {changePercentage > 0 ? '+' : ''}
            {changePercentage}%
          </span>
        )}
      </div>

      <p className="text-koyi-muted mt-5 text-sm font-medium">{label}</p>
      <p className="text-koyi-text font-display text-koyi-stat mt-1 leading-none font-extrabold">
        {value}
      </p>
    </div>
  );
}

/**
 * School Admin landing screen (design reference page 9) — headline counts plus
 * the two FLN analytics charts, scoped to the selected term.
 *
 * Every figure is read straight off the API response: no band thresholds,
 * averages or trends are computed in the browser.
 */
export function SchoolAdminDashboardPage() {
  const [term, setTerm] = useState<TermFilter>('this_term');
  const [breakdown, setBreakdown] = useState<LevelBreakdown>('by_grade');

  const summaryQuery = useQuery(dashboardSummaryQuery(term));

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Summary"
        subtitle="High-level overview of Foundation Literacy and Numeracy (FLN) metrics."
        actions={
          <SegmentedControl
            label="Reporting period"
            value={term}
            options={TERM_OPTIONS}
            onChange={setTerm}
          />
        }
      />

      {summaryQuery.isPending && <PageSpinner />}

      {summaryQuery.isError && (
        <ErrorState
          error={summaryQuery.error}
          onRetry={() => {
            void summaryQuery.refetch();
          }}
        />
      )}

      {summaryQuery.data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Total Teachers"
              value={summaryQuery.data.stats.total_teachers.value}
              changePercentage={summaryQuery.data.stats.total_teachers.change_percentage}
              Icon={UsersIcon}
              chipClassName="bg-koyi-primary text-white"
              trendClassName="bg-koyi-primary text-white"
            />
            <StatCard
              label="Total Students"
              value={summaryQuery.data.stats.total_students.value}
              changePercentage={summaryQuery.data.stats.total_students.change_percentage}
              Icon={GraduationCapIcon}
              chipClassName="bg-koyi-band-intermediate-soft text-koyi-primary"
              trendClassName="bg-koyi-band-intermediate-soft text-koyi-primary"
            />
            <StatCard
              label="Active Classes"
              value={summaryQuery.data.stats.active_classes.value}
              changePercentage={summaryQuery.data.stats.active_classes.change_percentage}
              Icon={LayersIcon}
              chipClassName="bg-koyi-nav-active text-koyi-primary"
              trendClassName="bg-koyi-nav-active text-koyi-primary"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card
              title="Learning Level Distribution"
              className="xl:col-span-2"
              action={
                <UnderlineTabs
                  label="Learning level breakdown"
                  value={breakdown}
                  options={BREAKDOWN_OPTIONS}
                  onChange={setBreakdown}
                />
              }
            >
              <LearningLevelChart data={summaryQuery.data.learning_levels[breakdown]} />
            </Card>

            <Card title="Overall Progress" subtitle="Last 6 Months Trend">
              <ProgressTrendChart data={summaryQuery.data.progress_trend.points} />

              <div className="bg-koyi-sidebar border-koyi-border rounded-koyi-lg mt-5 flex items-center justify-between gap-3 border p-4">
                <div>
                  <p className="text-koyi-muted text-xs font-medium">Net Improvement</p>
                  <p className="text-koyi-text font-display mt-0.5 text-xl font-extrabold">
                    {summaryQuery.data.progress_trend.net_improvement_percentage > 0 ? '+' : ''}
                    {summaryQuery.data.progress_trend.net_improvement_percentage}%
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="bg-koyi-band-strong-soft text-koyi-success flex size-9 items-center justify-center rounded-full"
                >
                  <TrendingUpIcon className="size-4" />
                </span>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
