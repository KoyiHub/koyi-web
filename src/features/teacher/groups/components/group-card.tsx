import { Link } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { paths } from '@/config/paths';
import { type Group, groupStatusLabels } from '@/features/teacher/groups/data/groups-fixture';

const statusTone = {
  'needs-intervention': 'danger',
  'on-track': 'info',
  'exceeding-expectations': 'success',
} as const;

const performanceFill = {
  'needs-intervention': 'bg-koyi-danger',
  'on-track': 'bg-koyi-primary',
  'exceeding-expectations': 'bg-koyi-success',
} as const;

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <article className="rounded-koyi-lg border-koyi-border bg-koyi-card flex flex-col gap-4 border p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-koyi-text text-base font-semibold">{group.name}</h3>
        <Badge tone={statusTone[group.status]}>{groupStatusLabels[group.status]}</Badge>
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-koyi-muted">Students</dt>
          <dd className="text-koyi-text font-medium">{group.studentCount}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-koyi-muted">Primary Need</dt>
          <dd className="text-koyi-text text-right font-medium">{group.primaryNeed}</dd>
        </div>
      </dl>

      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-koyi-muted">Average Performance</span>
          <span className="text-koyi-text font-semibold">{group.averagePerformance}%</span>
        </div>
        <div
          role="img"
          aria-label={`Average performance ${group.averagePerformance}%`}
          className="bg-koyi-surface mt-2 h-2 w-full overflow-hidden rounded-full"
        >
          <div
            className={`h-full rounded-full ${performanceFill[group.status]}`}
            style={{ width: `${group.averagePerformance}%` }}
          />
        </div>
      </div>

      <Link
        to={paths.teacher.students.groupDetail(group.id)}
        className="text-koyi-primary mt-auto flex h-11 items-center text-sm font-semibold hover:underline"
      >
        View Details{' '}
        <span aria-hidden="true" className="ml-1">
          →
        </span>
      </Link>
    </article>
  );
}
