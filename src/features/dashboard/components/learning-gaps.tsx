import type { ClassDashboard } from '@/features/dashboard/data/dashboard-fixture';

interface LearningGapsProps {
  dashboard: ClassDashboard;
}

export function LearningGaps({ dashboard }: LearningGapsProps) {
  return (
    <section
      aria-labelledby="learning-gaps-heading"
      className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-5"
    >
      <h2 id="learning-gaps-heading" className="text-koyi-text text-base font-semibold">
        Common Learning Gaps
      </h2>

      <ul className="divide-koyi-border mt-4 divide-y">
        {dashboard.learningGaps.map((gap) => (
          <li key={gap.skill} className="flex items-center justify-between py-3 text-sm">
            <span className="text-koyi-text font-medium">{gap.skill}</span>
            <span className="text-koyi-danger">{gap.strugglingStudents} students struggling</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
