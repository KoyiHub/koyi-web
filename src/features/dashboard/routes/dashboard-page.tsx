import { Button } from '@/components/ui/button';
import { LearningGaps } from '@/features/dashboard/components/learning-gaps';
import { PerformanceBreakdown } from '@/features/dashboard/components/performance-breakdown';
import { SummaryCards } from '@/features/dashboard/components/summary-cards';
import { dashboardFixture } from '@/features/dashboard/data/dashboard-fixture';

export function DashboardPage() {
  const dashboard = dashboardFixture;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-koyi-text text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-koyi-muted mt-1 text-sm">Overview of {dashboard.className}</p>
        </div>

        <Button>Create Assessment</Button>
      </header>

      <SummaryCards dashboard={dashboard} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PerformanceBreakdown dashboard={dashboard} />
        </div>
        <div>
          <LearningGaps dashboard={dashboard} />
        </div>
      </div>
    </div>
  );
}
