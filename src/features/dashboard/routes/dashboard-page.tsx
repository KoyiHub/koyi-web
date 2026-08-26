import { useQuery } from '@tanstack/react-query';

import { meQuery } from '@/features/auth/api/queries';
import { AiInsightsCard } from '@/features/dashboard/components/ai-insights-card';
import { ClassDistribution } from '@/features/dashboard/components/class-distribution';
import { QuickActions } from '@/features/dashboard/components/quick-actions';
import { StatCards } from '@/features/dashboard/components/stat-cards';
import { StudentsNeedingAttention } from '@/features/dashboard/components/students-needing-attention';
import { dashboardFixture } from '@/features/dashboard/data/dashboard-fixture';

export function DashboardPage() {
  const dashboard = dashboardFixture;
  // Real `/me/` data drives the greeting name; everything else on this page
  // stays fixture-driven until a dashboard backend contract exists.
  const { data: me } = useQuery(meQuery());
  const greetingName = me?.first_name ?? 'there';

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <header>
        <h1 className="text-koyi-text text-2xl font-semibold tracking-tight">
          Good morning, {greetingName} <span aria-hidden="true">👋</span>
        </h1>
        <p className="text-koyi-muted mt-1 text-sm">
          Here&apos;s what&apos;s happening in {dashboard.className} today.
        </p>
      </header>

      <StatCards dashboard={dashboard} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ClassDistribution dashboard={dashboard} />
        </div>
        <div className="space-y-6">
          <AiInsightsCard dashboard={dashboard} />
          <QuickActions />
        </div>
      </div>

      <StudentsNeedingAttention dashboard={dashboard} />
    </div>
  );
}
