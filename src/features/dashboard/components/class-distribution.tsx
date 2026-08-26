import type { ClassDashboard, PerformanceBand } from '@/features/dashboard/data/dashboard-fixture';

const bandFill: Record<PerformanceBand, string> = {
  strong: 'bg-koyi-success',
  intermediate: 'bg-koyi-warning',
  struggling: 'bg-koyi-danger',
};

interface ClassDistributionProps {
  dashboard: ClassDashboard;
}

/**
 * Three separate labelled horizontal bars (Strong / Intermediate /
 * Struggling), matching PDF p20's distribution treatment — a single combined
 * stacked bar was tried previously and did not match the reference.
 */
export function ClassDistribution({ dashboard }: ClassDistributionProps) {
  return (
    <section
      aria-labelledby="class-distribution-heading"
      className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-5"
    >
      <h2 id="class-distribution-heading" className="text-koyi-text text-lg font-semibold">
        Class Distribution
      </h2>

      <ul className="mt-4 space-y-4">
        {dashboard.performance.map((segment) => (
          <li key={segment.band}>
            <div className="text-koyi-text mb-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <span
                  aria-hidden="true"
                  className={`size-2.5 rounded-full ${bandFill[segment.band]}`}
                />
                {segment.label}
              </span>
              <span className="text-koyi-muted">
                {segment.percentage}% ({segment.students} students)
              </span>
            </div>
            <div
              role="img"
              aria-label={`${segment.label} ${segment.percentage}%`}
              className="bg-koyi-surface h-3 w-full overflow-hidden rounded-full"
            >
              <span
                className={`block h-full rounded-full ${bandFill[segment.band]}`}
                style={{ width: `${segment.percentage}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
