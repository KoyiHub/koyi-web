import type { ClassDashboard } from '@/features/dashboard/data/dashboard-fixture';

interface StatCardsProps {
  dashboard: ClassDashboard;
}

/** Three headline stats: roster size, assessment coverage, and attention count. */
export function StatCards({ dashboard }: StatCardsProps) {
  const assessedPercentage = Math.round((dashboard.assessedCount / dashboard.totalStudents) * 100);

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <li className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-5">
        <p className="text-koyi-muted text-sm font-medium">Total Students</p>
        <p className="text-koyi-text text-koyi-stat mt-2 leading-none font-semibold">
          {dashboard.totalStudents}
        </p>
      </li>

      <li className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-5">
        <p className="text-koyi-muted text-sm font-medium">Assessed</p>
        <p className="text-koyi-text text-koyi-stat mt-2 leading-none font-semibold">
          {dashboard.assessedCount}
          <span className="text-koyi-muted text-lg font-medium">/{dashboard.totalStudents}</span>
        </p>
        <p className="text-koyi-muted mt-1 text-sm">{assessedPercentage}% of the class</p>
      </li>

      <li className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-5">
        <p className="text-koyi-muted text-sm font-medium">Needs Attention</p>
        <p className="text-koyi-danger text-koyi-stat mt-2 leading-none font-semibold">
          {dashboard.attentionCount}
        </p>
        <p className="text-koyi-warning mt-1 text-sm font-medium">
          {dashboard.attentionTrend} since last assessment
        </p>
      </li>
    </ul>
  );
}
