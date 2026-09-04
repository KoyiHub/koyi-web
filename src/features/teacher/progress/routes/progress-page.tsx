import { Badge } from '@/components/ui/badge';
import { StatBar } from '@/components/ui/stat-bar';
import {
  assessmentComparison,
  classContext,
  type LevelCounts,
  notableMovements,
  skillProgress,
  type SkillTrend,
} from '@/features/teacher/progress/data/progress-fixture';
import { studentLevelLabels } from '@/features/teacher/students/data/students-fixture';

const levelRows: { key: keyof LevelCounts; label: string; toneClassName: string }[] = [
  { key: 'strong', label: 'Strong', toneClassName: 'bg-koyi-success' },
  { key: 'intermediate', label: 'Intermediate', toneClassName: 'bg-koyi-warning' },
  { key: 'struggling', label: 'Struggling', toneClassName: 'bg-koyi-danger' },
];

const levelTone = {
  strong: 'success',
  intermediate: 'warning',
  struggling: 'danger',
} as const;

const trendTone: Record<SkillTrend, 'success' | 'warning'> = {
  Improving: 'success',
  'Needs Focus': 'warning',
};

const allLevelCounts: number[] = levelRows.flatMap((row) => [
  assessmentComparison.previous[row.key],
  assessmentComparison.latest[row.key],
]);
const maxCount = Math.max(...allLevelCounts);

export function ProgressPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <header>
        <h1 className="text-koyi-text text-2xl font-semibold tracking-tight">Class Progress</h1>
        <p className="text-koyi-muted mt-1 text-sm">{classContext}</p>
      </header>

      <section
        aria-labelledby="assessment-comparison-heading"
        className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-6"
      >
        <h2 id="assessment-comparison-heading" className="text-koyi-text text-base font-semibold">
          Assessment Comparison
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-koyi-muted text-sm font-semibold">Previous Assessment</h3>
            <div className="mt-3 space-y-4">
              {levelRows.map((row) => (
                <StatBar
                  key={row.key}
                  label={row.label}
                  valueLabel={String(assessmentComparison.previous[row.key])}
                  percentage={(assessmentComparison.previous[row.key] / maxCount) * 100}
                  toneClassName={row.toneClassName}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-koyi-muted text-sm font-semibold">Latest Assessment</h3>
            <div className="mt-3 space-y-4">
              {levelRows.map((row) => (
                <StatBar
                  key={row.key}
                  label={row.label}
                  valueLabel={String(assessmentComparison.latest[row.key])}
                  percentage={(assessmentComparison.latest[row.key] / maxCount) * 100}
                  toneClassName={row.toneClassName}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="notable-movements-heading"
        className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-6"
      >
        <h2 id="notable-movements-heading" className="text-koyi-text text-base font-semibold">
          Notable Movements
        </h2>

        <ul className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {notableMovements.map((movement) => (
            <li
              key={movement.studentName}
              className="border-koyi-border rounded-koyi-md border p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-koyi-text text-sm font-semibold">{movement.studentName}</p>
                <Badge tone="success">{movement.outcomeLabel}</Badge>
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm">
                <Badge tone={levelTone[movement.from]}>{studentLevelLabels[movement.from]}</Badge>
                <span aria-hidden="true" className="text-koyi-muted">
                  →
                </span>
                <Badge tone={levelTone[movement.to]}>{studentLevelLabels[movement.to]}</Badge>
              </div>

              <p className="text-koyi-muted mt-3 text-sm">
                Still needs support: {movement.supportAreas.join(', ')}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="skill-progress-heading"
        className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-6"
      >
        <h2 id="skill-progress-heading" className="text-koyi-text text-base font-semibold">
          Skill Progress
        </h2>
        <p className="text-koyi-muted mt-1 text-xs">
          Areas improving across the class — provisional, qualitative only.
        </p>

        <ul className="mt-4 flex flex-wrap gap-3">
          {skillProgress.map((entry) => (
            <li
              key={entry.skill}
              className="border-koyi-border rounded-koyi-md flex items-center gap-2 border px-3 py-2 text-sm"
            >
              <span className="text-koyi-text font-medium">{entry.skill}</span>
              <Badge tone={trendTone[entry.trendLabel]}>{entry.trendLabel}</Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
