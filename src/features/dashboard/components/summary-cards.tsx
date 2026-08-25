import type { ClassDashboard, PerformanceBand } from '@/features/dashboard/data/dashboard-fixture';

const bandAccent: Record<PerformanceBand, string> = {
  strong: 'text-koyi-success',
  intermediate: 'text-koyi-warning',
  struggling: 'text-koyi-danger',
};

interface SummaryCardsProps {
  dashboard: ClassDashboard;
}

export function SummaryCards({ dashboard }: SummaryCardsProps) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <li className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-5">
        <p className="text-koyi-muted text-sm font-medium">Total Students</p>
        <p className="text-koyi-text mt-2 text-3xl font-semibold">{dashboard.totalStudents}</p>
      </li>

      {dashboard.performance.map((segment) => (
        <li
          key={segment.band}
          className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-5"
        >
          <p className="text-koyi-muted text-sm font-medium">{segment.label}</p>
          <p className={`mt-2 text-3xl font-semibold ${bandAccent[segment.band]}`}>
            {segment.students}
          </p>
          <p className="text-koyi-muted mt-1 text-sm">{segment.percentage}% of the class</p>
        </li>
      ))}
    </ul>
  );
}
