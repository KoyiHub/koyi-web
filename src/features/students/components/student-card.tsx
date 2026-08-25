import { Link } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { paths } from '@/config/paths';
import { type Student, studentLevelLabels } from '@/features/students/data/students-fixture';

const levelTone = {
  strong: 'success',
  intermediate: 'warning',
  struggling: 'danger',
} as const;

interface StudentCardProps {
  student: Student;
}

export function StudentCard({ student }: StudentCardProps) {
  return (
    <article className="rounded-koyi-lg border-koyi-border bg-koyi-card flex flex-col gap-4 border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-koyi-text truncate text-base font-semibold">{student.name}</h3>
          <p className="text-koyi-muted mt-0.5 text-xs">ID: {student.studentCode}</p>
        </div>
        <Badge tone={levelTone[student.level]}>{studentLevelLabels[student.level]}</Badge>
      </div>

      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-koyi-muted text-xs font-medium">Learning Gaps</dt>
          <dd className="text-koyi-text mt-0.5">{student.learningGaps.join(', ')}</dd>
        </div>
        <div>
          <dt className="text-koyi-muted text-xs font-medium">Last Assessed</dt>
          <dd className="text-koyi-text mt-0.5">{student.lastAssessed}</dd>
        </div>
      </dl>

      <Link
        to={paths.students.detail(student.id)}
        className="text-koyi-primary mt-auto flex h-11 items-center text-sm font-semibold hover:underline"
      >
        View details{' '}
        <span aria-hidden="true" className="ml-1">
          →
        </span>
      </Link>
    </article>
  );
}
