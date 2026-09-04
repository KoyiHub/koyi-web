import { useQuery } from '@tanstack/react-query';
import type { ComponentType, SVGProps } from 'react';

import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { GraduationCapIcon, LayersIcon, UsersIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { StatBar } from '@/components/ui/stat-bar';
import { overviewQuery } from '@/features/school-admin/dashboard/api/queries';
import { ASSESSMENT_STATUS_LABEL } from '@/lib/api/format';
import { DOMAIN_LABEL, levelDistributionRows, levelLabel } from '@/lib/fln/level';
import { cn } from '@/lib/utils/cn';

const DOMAINS = ['literacy', 'numeracy'] as const;

interface StatCardProps {
  label: string;
  value: number;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  chipClassName: string;
}

function StatCard({ label, value, Icon, chipClassName }: StatCardProps) {
  return (
    <div className="rounded-koyi-xl border-koyi-border bg-koyi-card border p-5">
      <span
        aria-hidden="true"
        className={cn('flex size-11 items-center justify-center rounded-full', chipClassName)}
      >
        <Icon className="size-5" />
      </span>
      <p className="text-koyi-muted mt-5 text-sm font-medium">{label}</p>
      <p className="text-koyi-text font-display text-koyi-stat mt-1 leading-none font-extrabold">
        {value}
      </p>
    </div>
  );
}

/**
 * School Admin landing screen — `frontend-integration.md` §4.7.
 *
 * Leads with `level_distribution`, not an average: "a class with more Level
 * 1 children is differently composed, not worse" (§9), and the guide's own
 * design note says this screen should lead with distribution once placement
 * lands, which it now has. Every figure is read straight off the response —
 * no band thresholds or averages are computed in the browser.
 */
export function SchoolAdminDashboardPage() {
  const overview = useQuery(overviewQuery());

  if (overview.isPending) return <PageSpinner />;
  if (overview.isError || !overview.data) {
    return <ErrorState error={overview.error} onRetry={() => void overview.refetch()} />;
  }

  const data = overview.data;
  const maxDistribution = Math.max(
    1,
    ...DOMAINS.flatMap((domain) =>
      levelDistributionRows(data.level_distribution[domain]).map((row) => row.students),
    ),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Summary"
        subtitle={`${data.current_session_label} — high-level overview of Foundation Literacy and Numeracy (FLN) levels.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Teachers"
          value={data.teachers_count}
          Icon={UsersIcon}
          chipClassName="bg-koyi-primary text-white"
        />
        <StatCard
          label="Total Students"
          value={data.students_count}
          Icon={GraduationCapIcon}
          chipClassName="bg-koyi-band-intermediate-soft text-koyi-primary"
        />
        <StatCard
          label="Active Assessments"
          value={data.active_assessments}
          Icon={LayersIcon}
          chipClassName="bg-koyi-nav-active text-koyi-primary"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {DOMAINS.map((domain) => (
          <Card key={domain} title={`${DOMAIN_LABEL[domain]} — level distribution`}>
            <div className="space-y-3">
              {levelDistributionRows(data.level_distribution[domain]).map((row) => (
                <StatBar
                  key={row.level}
                  label={levelLabel(row.level)}
                  valueLabel={`${String(row.students)} ${row.students === 1 ? 'child' : 'children'}`}
                  percentage={(row.students / maxDistribution) * 100}
                />
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card
        title="Assessments by status"
        subtitle={`${data.assessments_count} papers created in total.`}
      >
        <div className="flex flex-wrap gap-3">
          {Object.entries(data.status_breakdown).map(([status, count]) => (
            <span
              key={status}
              className="bg-koyi-surface text-koyi-text rounded-full px-3 py-1.5 text-sm font-medium"
            >
              {ASSESSMENT_STATUS_LABEL[status as keyof typeof ASSESSMENT_STATUS_LABEL] ?? status}:{' '}
              <span className="font-bold">{count}</span>
            </span>
          ))}
        </div>
        {data.average_graded_score && (
          <p className="text-koyi-muted mt-4 text-xs">
            Average graded score across every completed paper: {data.average_graded_score}%. A
            single figure across two independent domains — treat it as a rough indicator, not a
            level.
          </p>
        )}
      </Card>
    </div>
  );
}
