import { Link, useNavigate, useParams } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatBar } from '@/components/ui/stat-bar';
import { paths } from '@/config/paths';
import {
  findGroupDetailById,
  groupStudentStatusLabels,
} from '@/features/students/data/group-detail-fixture';
import { groups } from '@/features/students/data/groups-fixture';

const studentStatusTone = {
  'needs-help': 'danger',
  intermediate: 'warning',
  strong: 'success',
} as const;

const backLink = (
  <Link
    to={paths.teacher.students.groups}
    className="text-koyi-primary flex h-11 w-fit items-center text-sm font-semibold"
  >
    <span aria-hidden="true" className="mr-1">
      ←
    </span>{' '}
    Back to Groups
  </Link>
);

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const group = groups.find((candidate) => candidate.id === groupId);

  if (!group) {
    return (
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {backLink}
        <div className="rounded-koyi-lg border-koyi-border bg-koyi-card border border-dashed p-8 text-center">
          <h1 className="text-koyi-text text-xl font-semibold">Group not found</h1>
          <p className="text-koyi-muted mt-2 text-sm">
            We couldn't find a group with that ID. It may have been removed, or the link may be
            incorrect.
          </p>
        </div>
      </div>
    );
  }

  const detail = findGroupDetailById(group.id);

  if (!detail) {
    return (
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {backLink}
        <div className="rounded-koyi-lg border-koyi-border bg-koyi-card border border-dashed p-8 text-center">
          <h1 className="text-koyi-text text-xl font-semibold">{group.name}</h1>
          <p className="text-koyi-muted mt-2 text-sm">
            Detailed metrics for this group aren't available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      {backLink}

      <header className="rounded-koyi-lg border-koyi-border bg-koyi-card flex flex-col gap-4 border p-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-koyi-text text-2xl font-semibold tracking-tight">{group.name}</h1>
          <p className="text-koyi-muted mt-1 text-sm">
            {detail.grade} · {detail.studentCountLabel} · {detail.description}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-start lg:items-end">
          <Button
            onClick={() => {
              void navigate(paths.teacher.assessment.setup);
            }}
          >
            Reassess Group
          </Button>
          <Button
            variant="secondary"
            disabled
            title="Adding or removing students is not available yet"
          >
            Add/Remove Students
          </Button>
          <a
            href="#group-roster"
            className="text-koyi-primary flex h-11 items-center px-2 text-sm font-semibold hover:underline"
          >
            View Full Roster
          </a>
        </div>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <li className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-5">
          <p className="text-koyi-muted text-sm font-medium">Group Average</p>
          <p className="text-koyi-text mt-2 text-3xl font-semibold">
            {detail.metrics.averagePercentage}%
          </p>
        </li>
        <li className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-5">
          <p className="text-koyi-muted text-sm font-medium">Growth (30 days)</p>
          <p className="text-koyi-success mt-2 text-3xl font-semibold">
            +{detail.metrics.growthPercentagePoints}%
          </p>
        </li>
        <li className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-5">
          <p className="text-koyi-muted text-sm font-medium">Critical Needs</p>
          <p className="text-koyi-danger mt-2 text-3xl font-semibold">
            {detail.metrics.criticalNeeds}
          </p>
        </li>
        <li className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-5">
          <p className="text-koyi-muted text-sm font-medium">Last Session</p>
          <p className="text-koyi-text mt-2 text-3xl font-semibold">
            {detail.metrics.lastSessionLabel}
          </p>
        </li>
      </ul>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section
            id="group-roster"
            aria-labelledby="group-students-heading"
            className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-6"
          >
            <h2 id="group-students-heading" className="text-koyi-text text-base font-semibold">
              Students in This Group
            </h2>
            <ul className="border-koyi-border mt-3 divide-y">
              {detail.studentsPreview.map((student) => (
                <li
                  key={student.name}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div>
                    <p className="text-koyi-text text-sm font-medium">{student.name}</p>
                    <p className="text-koyi-muted text-sm">{student.note}</p>
                  </div>
                  <Badge tone={studentStatusTone[student.status]}>
                    {groupStudentStatusLabels[student.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="group-skill-gaps-heading"
            className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-6"
          >
            <h2 id="group-skill-gaps-heading" className="text-koyi-text text-base font-semibold">
              Common Skill Gaps
            </h2>
            <div className="mt-4 space-y-4">
              {detail.skillGaps.map((gap) => (
                <StatBar
                  key={gap.skill}
                  label={gap.skill}
                  valueLabel={`${gap.strugglingCount}/${gap.totalCount} Struggling`}
                  percentage={(gap.strugglingCount / gap.totalCount) * 100}
                  toneClassName="bg-koyi-danger"
                />
              ))}
            </div>
          </section>

          <section
            aria-labelledby="group-recent-assessments-heading"
            className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-6"
          >
            <h2
              id="group-recent-assessments-heading"
              className="text-koyi-text text-base font-semibold"
            >
              Recent Assessments
            </h2>
            <ul className="border-koyi-border mt-3 divide-y">
              {detail.recentAssessments.map((assessment) => (
                <li
                  key={`${assessment.date}-${assessment.name}`}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div>
                    <p className="text-koyi-text text-sm font-medium">{assessment.name}</p>
                    <p className="text-koyi-muted text-sm">{assessment.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-koyi-text text-sm font-semibold">
                      {assessment.averagePercentage}%
                    </span>
                    <Badge tone="info">{assessment.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section
          aria-labelledby="group-recommendations-heading"
          className="rounded-koyi-lg border-koyi-border bg-koyi-card h-fit border p-6"
        >
          <h2 id="group-recommendations-heading" className="text-koyi-text text-base font-semibold">
            Recommended Resources
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {detail.recommendations.map((resource) => (
              <li key={resource} className="text-koyi-text flex items-start gap-2">
                <span aria-hidden="true" className="text-koyi-primary mt-0.5">
                  •
                </span>
                {resource}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
