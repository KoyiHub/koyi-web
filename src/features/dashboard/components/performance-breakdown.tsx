import type { ClassDashboard, PerformanceBand } from '@/features/dashboard/data/dashboard-fixture';

const bandFill: Record<PerformanceBand, string> = {
  strong: 'bg-koyi-success',
  intermediate: 'bg-koyi-warning',
  struggling: 'bg-koyi-danger',
};

interface PerformanceBreakdownProps {
  dashboard: ClassDashboard;
}

/**
 * Colour-coded distribution bar plus a labelled legend, so the breakdown is
 * readable without relying on colour alone.
 */
export function PerformanceBreakdown({ dashboard }: PerformanceBreakdownProps) {
  return (
    <section
      aria-labelledby="performance-breakdown-heading"
      className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-5"
    >
      <h2 id="performance-breakdown-heading" className="text-koyi-text text-base font-semibold">
        Class Performance Breakdown
      </h2>

      <div
        role="img"
        aria-label={dashboard.performance
          .map((segment) => `${segment.label} ${segment.percentage}%`)
          .join(', ')}
        className="mt-4 flex h-3 w-full overflow-hidden rounded-full"
      >
        {dashboard.performance.map((segment) => (
          <span
            key={segment.band}
            className={bandFill[segment.band]}
            style={{ width: `${segment.percentage}%` }}
          />
        ))}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {dashboard.performance.map((segment) => (
          <li key={segment.band} className="text-koyi-text flex items-center gap-2 text-sm">
            <span
              aria-hidden="true"
              className={`size-2.5 rounded-full ${bandFill[segment.band]}`}
            />
            {segment.label} — {segment.percentage}% ({segment.students} students)
          </li>
        ))}
      </ul>
    </section>
  );
}
