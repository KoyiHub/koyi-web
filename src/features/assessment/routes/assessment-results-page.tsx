import { Link, useNavigate } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatBar } from '@/components/ui/stat-bar';
import { paths } from '@/config/paths';
import {
  commonLearningGaps,
  levelSummary,
  resultsContext,
  skillPerformance,
  studentResults,
} from '@/features/assessment/data/assessment-results-fixture';
import { studentLevelLabels } from '@/features/students/data/students-fixture';

const levelTone = {
  strong: 'success',
  intermediate: 'warning',
  struggling: 'danger',
} as const;

const summaryRows: { key: keyof typeof levelSummary; label: string; toneClassName: string }[] = [
  { key: 'strong', label: 'Strong', toneClassName: 'bg-koyi-success' },
  { key: 'intermediate', label: 'Intermediate', toneClassName: 'bg-koyi-warning' },
  { key: 'struggling', label: 'Struggling', toneClassName: 'bg-koyi-danger' },
];

export function AssessmentResultsPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <header>
        <h1 className="text-koyi-text text-2xl font-semibold tracking-tight">Assessment Results</h1>
        <p className="text-koyi-muted mt-1 text-sm">
          {resultsContext.className} · {resultsContext.assessmentName} · Completed{' '}
          {resultsContext.completedDate} · {resultsContext.studentsAssessed} Students Assessed
        </p>
      </header>

      <section
        aria-labelledby="results-summary-heading"
        className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-6"
      >
        <h2 id="results-summary-heading" className="text-koyi-text text-base font-semibold">
          Summary
        </h2>

        <div className="mt-4 space-y-4">
          {summaryRows.map((row) => {
            const count = levelSummary[row.key];
            const percentage = Math.round((count / resultsContext.studentsAssessed) * 100);
            return (
              <StatBar
                key={row.key}
                label={row.label}
                valueLabel={`${count} / ${percentage}%`}
                percentage={percentage}
                toneClassName={row.toneClassName}
              />
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section
          aria-labelledby="skill-performance-heading"
          className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-6 lg:col-span-2"
        >
          <h2 id="skill-performance-heading" className="text-koyi-text text-base font-semibold">
            Skill Performance
          </h2>

          <div className="mt-4 space-y-4">
            {skillPerformance.map((entry) => (
              <StatBar
                key={entry.skill}
                label={entry.skill}
                valueLabel={`${entry.percentage}%`}
                percentage={entry.percentage}
              />
            ))}
          </div>
        </section>

        <section
          aria-labelledby="learning-gaps-heading"
          className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-6"
        >
          <h2 id="learning-gaps-heading" className="text-koyi-text text-base font-semibold">
            Common Learning Gaps
          </h2>

          <ul className="divide-koyi-border mt-4 divide-y">
            {commonLearningGaps.map((gap) => (
              <li key={gap.skill} className="flex items-center justify-between py-3 text-sm">
                <span className="text-koyi-text font-medium">{gap.skill}</span>
                <span className="text-koyi-danger">{gap.studentCount} students</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section
        aria-labelledby="student-results-heading"
        className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-6"
      >
        <h2 id="student-results-heading" className="text-koyi-text text-base font-semibold">
          Student Results
        </h2>

        {/* Desktop/tablet: semantic table. Below `sm`, replaced with a stacked list to avoid horizontal scrolling. */}
        <div className="mt-4 hidden overflow-x-auto sm:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-koyi-border border-b">
                <th scope="col" className="text-koyi-muted py-2 pr-4 font-medium">
                  Student
                </th>
                <th scope="col" className="text-koyi-muted py-2 pr-4 font-medium">
                  Score
                </th>
                <th scope="col" className="text-koyi-muted py-2 pr-4 font-medium">
                  Level
                </th>
                <th scope="col" className="text-koyi-muted py-2 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-koyi-border divide-y">
              {studentResults.map((result) => (
                <tr key={result.studentId}>
                  <td className="text-koyi-text py-3 pr-4 font-medium">{result.name}</td>
                  <td className="text-koyi-text py-3 pr-4">{result.percentage}%</td>
                  <td className="py-3 pr-4">
                    <Badge tone={levelTone[result.level]}>{studentLevelLabels[result.level]}</Badge>
                  </td>
                  <td className="py-3">
                    <Link
                      to={paths.teacher.students.detail(result.studentId)}
                      className="text-koyi-primary text-sm font-semibold hover:underline"
                    >
                      View Student
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="border-koyi-border mt-4 divide-y sm:hidden">
          {studentResults.map((result) => (
            <li key={result.studentId} className="flex flex-col gap-2 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-koyi-text text-sm font-medium">{result.name}</span>
                <Badge tone={levelTone[result.level]}>{studentLevelLabels[result.level]}</Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-koyi-muted text-sm">{result.percentage}%</span>
                <Link
                  to={paths.teacher.students.detail(result.studentId)}
                  className="text-koyi-primary text-sm font-semibold hover:underline"
                >
                  View Student
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          onClick={() => {
            void navigate(paths.teacher.dashboard);
          }}
        >
          Back to Dashboard
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            void navigate(paths.teacher.progress);
          }}
        >
          View Class Progress
        </Button>
        <Button
          onClick={() => {
            void navigate(paths.teacher.assessment.setup);
          }}
        >
          New Assessment
        </Button>
      </div>
    </div>
  );
}
