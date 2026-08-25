import { Link, useNavigate, useParams } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { findStudentById, studentLevelLabels } from '@/features/students/data/students-fixture';

const levelTone = {
  strong: 'success',
  intermediate: 'warning',
  struggling: 'danger',
} as const;

const skillRows = [
  { key: 'reading', label: 'Reading' },
  { key: 'comprehension', label: 'Comprehension' },
  { key: 'mathematics', label: 'Mathematics' },
] as const;

export function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const student = studentId ? findStudentById(studentId) : undefined;

  if (!student) {
    return (
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        <Link
          to={paths.students.list}
          className="text-koyi-primary flex h-11 w-fit items-center text-sm font-semibold"
        >
          <span aria-hidden="true" className="mr-1">
            ←
          </span>{' '}
          Back to Students
        </Link>
        <div className="rounded-koyi-lg border-koyi-border bg-koyi-card border border-dashed p-8 text-center">
          <h1 className="text-koyi-text text-xl font-semibold">Student not found</h1>
          <p className="text-koyi-muted mt-2 text-sm">
            We couldn't find a student with that ID. They may have been removed, or the link may be
            incorrect.
          </p>
        </div>
      </div>
    );
  }

  const grade = student.className.split(' - ')[0];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <Link
        to={paths.students.list}
        className="text-koyi-primary flex h-11 w-fit items-center text-sm font-semibold"
      >
        <span aria-hidden="true" className="mr-1">
          ←
        </span>{' '}
        Back to Students
      </Link>

      <header className="rounded-koyi-lg border-koyi-border bg-koyi-card flex flex-col gap-4 border p-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-koyi-text text-2xl font-semibold tracking-tight">{student.name}</h1>
          <p className="text-koyi-muted mt-1 text-sm">{grade}</p>
          <dl className="text-koyi-text mt-4 grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-koyi-muted text-xs font-medium">Student ID</dt>
              <dd className="mt-0.5 font-medium">{student.studentCode}</dd>
            </div>
            <div>
              <dt className="text-koyi-muted text-xs font-medium">Level</dt>
              <dd className="mt-0.5">
                <Badge tone={levelTone[student.level]}>{studentLevelLabels[student.level]}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-koyi-muted text-xs font-medium">Age</dt>
              <dd className="mt-0.5 font-medium">{student.age} yrs</dd>
            </div>
          </dl>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Button
            onClick={() => {
              void navigate(paths.assessment.setup);
            }}
          >
            Start New Assessment
          </Button>
          <Button
            variant="secondary"
            disabled
            title="Editing student profiles is not available yet"
          >
            Edit Profile
          </Button>
        </div>
      </header>

      <section className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-koyi-text text-base font-semibold">Latest Assessment</h2>
          <p className="text-koyi-muted text-sm">{student.latestAssessment.date}</p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {skillRows.map((row) => {
            const score = student.latestAssessment[row.key];
            return (
              <div key={row.key} className="border-koyi-border rounded-koyi-md border p-4">
                <p className="text-koyi-muted text-xs font-medium">{row.label}</p>
                <p className="text-koyi-text mt-1 text-2xl font-semibold">{score.percentage}%</p>
                <progress
                  value={score.percentage}
                  max={100}
                  aria-label={`${row.label} score ${score.percentage}%, ${score.label}`}
                  className="accent-koyi-primary mt-2 h-1.5 w-full"
                />
                <p className="text-koyi-muted mt-2 text-xs font-medium">{score.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-6">
          <h2 className="text-koyi-text text-base font-semibold">Strengths</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {student.strengths.map((strength) => (
              <li key={strength} className="text-koyi-text flex items-start gap-2">
                <span aria-hidden="true" className="text-koyi-success mt-0.5">
                  ✓
                </span>
                {strength}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-6">
          <h2 className="text-koyi-text text-base font-semibold">Learning Gaps</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {student.learningGaps.map((gap) => (
              <li key={gap} className="text-koyi-text flex items-start gap-2">
                <span aria-hidden="true" className="text-koyi-warning mt-0.5">
                  •
                </span>
                {gap}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-6">
        <h2 className="text-koyi-text text-base font-semibold">Assessment History</h2>
        <ul className="border-koyi-border mt-3 divide-y">
          {student.history.map((entry) => (
            <li key={entry.date} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <span className="text-koyi-text text-sm font-medium">{entry.date}</span>
              <span className="text-koyi-muted text-sm">{entry.label}</span>
              <span className="text-koyi-text text-sm font-semibold">
                Avg: {entry.averagePercentage}%
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
