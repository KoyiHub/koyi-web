import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  BarChartIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClipboardIcon,
  FlagIcon,
  HistoryIcon,
  StarIcon,
} from '@/components/ui/icons';
import { PageSpinner } from '@/components/ui/page-spinner';
import { paths } from '@/config/paths';
import {
  ASSESSMENT_TYPE_LABEL,
  BAND_BAR_CLASS,
  BAND_CHIP_CLASS,
  BAND_LABEL,
  formatDate,
  LEVEL_CHIP_CLASS,
  LEVEL_LABEL,
  SUBJECT_LABEL,
} from '@/features/school-admin/api/format';
import { studentDetailQuery } from '@/features/school-admin/students/api/queries';
import type { StudentDetail } from '@/features/school-admin/students/api/student.schema';
import { cn } from '@/lib/utils/cn';

function LatestAssessment({ student }: { student: StudentDetail }) {
  if (!student.latest_assessment) {
    return (
      <Card title="Latest Assessment" icon={<BarChartIcon className="size-4" />}>
        <p className="text-koyi-muted text-sm">
          {student.full_name} has not sat an assessment yet. Their first baseline result will appear
          here.
        </p>
      </Card>
    );
  }

  const { taken_on: takenOn, domain_scores: domainScores } = student.latest_assessment;

  return (
    <Card
      title="Latest Assessment"
      icon={<BarChartIcon className="size-4" />}
      action={
        <span className="bg-koyi-nav-active text-koyi-text inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
          <CalendarIcon aria-hidden="true" className="size-3.5" />
          {formatDate(takenOn)}
        </span>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {domainScores.map((domain) => (
          <div
            key={domain.key}
            className="bg-koyi-sidebar border-koyi-border rounded-koyi-lg border p-4"
          >
            <p className="text-koyi-muted text-xs font-medium">{domain.label}</p>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-koyi-primary font-display text-2xl font-extrabold">
                {domain.score}%
              </span>
              <span className="text-koyi-muted text-xs font-semibold">
                {BAND_LABEL[domain.band]}
              </span>
            </div>

            <div
              className="bg-koyi-nav-active mt-3 h-1.5 w-full overflow-hidden rounded-full"
              role="img"
              aria-label={`${domain.label}: ${String(domain.score)} percent, ${BAND_LABEL[domain.band]}`}
            >
              <div
                className={cn('h-full rounded-full', BAND_BAR_CLASS[domain.band])}
                style={{ width: `${String(domain.score)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function StudentProfile({ student }: { student: StudentDetail }) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="bg-koyi-nav-active border-transparent xl:col-span-2">
        <div className="flex flex-wrap items-center gap-5">
          <InitialsAvatar name={student.full_name} className="size-20 text-xl" />

          <div className="min-w-0">
            <h1 className="text-koyi-text font-display text-3xl font-extrabold">
              {student.full_name}
            </h1>
            <p className="text-koyi-muted mt-1 text-sm">
              {student.class_name} &middot; Student ID: {student.student_id}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-bold',
                  LEVEL_CHIP_CLASS[student.level],
                )}
              >
                Level: {LEVEL_LABEL[student.level]}
              </span>
              <span className="bg-koyi-card text-koyi-text inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                <CalendarIcon aria-hidden="true" className="size-3.5" />
                Age: {student.age} yrs
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Enrolment">
        <dl className="divide-koyi-border divide-y text-sm">
          <div className="flex items-baseline justify-between gap-4 py-2">
            <dt className="text-koyi-muted text-xs font-medium">Guardian</dt>
            <dd className="text-koyi-text truncate font-semibold">
              {student.guardian.name} ({student.guardian.relationship})
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-2">
            <dt className="text-koyi-muted text-xs font-medium">Phone</dt>
            <dd className="text-koyi-text font-semibold">{student.guardian.phone}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-2">
            <dt className="text-koyi-muted text-xs font-medium">Date of birth</dt>
            <dd className="text-koyi-text font-semibold">{formatDate(student.date_of_birth)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-2">
            <dt className="text-koyi-muted text-xs font-medium">Enrolled</dt>
            <dd className="text-koyi-text font-semibold">{formatDate(student.enrolled_on)}</dd>
          </div>
        </dl>
      </Card>

      <div className="space-y-4 xl:col-span-2">
        <LatestAssessment student={student} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Strengths" icon={<StarIcon className="size-4" />}>
            {student.strengths.length === 0 ? (
              <p className="text-koyi-muted text-sm">No strengths recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {student.strengths.map((strength) => (
                  <li
                    key={strength}
                    className="bg-koyi-sidebar text-koyi-text flex items-start gap-2.5 rounded-md px-3 py-2.5 text-sm"
                  >
                    <CheckCircleIcon
                      aria-hidden="true"
                      className="text-koyi-band-strong-ink mt-0.5 size-4 shrink-0"
                    />
                    {strength}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Learning Gaps" icon={<FlagIcon className="size-4" />}>
            {student.learning_gaps.length === 0 ? (
              <p className="text-koyi-muted text-sm">No gaps flagged yet.</p>
            ) : (
              <ul className="space-y-2">
                {student.learning_gaps.map((gap) => (
                  <li
                    key={gap}
                    className="bg-koyi-sidebar text-koyi-text flex items-start gap-2.5 rounded-md px-3 py-2.5 text-sm"
                  >
                    <AlertCircleIcon
                      aria-hidden="true"
                      className="text-koyi-band-struggling-ink mt-0.5 size-4 shrink-0"
                    />
                    {gap}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card
          title="Assessments taken"
          subtitle="Every sitting, with the score recorded."
          icon={<ClipboardIcon className="size-4" />}
          bodyClassName="overflow-x-auto"
        >
          {student.assessments.length === 0 ? (
            <p className="text-koyi-muted text-sm">No assessments taken yet.</p>
          ) : (
            <table className="w-full min-w-160 border-collapse text-left text-sm">
              <thead>
                <tr className="text-koyi-muted border-koyi-border border-b text-xs">
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Assessment
                  </th>
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Taken on
                  </th>
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Administered by
                  </th>
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Score
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Band
                  </th>
                </tr>
              </thead>

              <tbody className="divide-koyi-border divide-y">
                {student.assessments.map((assessment) => (
                  <tr key={assessment.id}>
                    <td className="py-3 pr-4">
                      <p className="text-koyi-text font-bold">{assessment.title}</p>
                      <p className="text-koyi-muted text-xs">
                        {SUBJECT_LABEL[assessment.subject]} &middot;{' '}
                        {ASSESSMENT_TYPE_LABEL[assessment.assessment_type]}
                      </p>
                    </td>
                    <td className="text-koyi-text py-3 pr-4 whitespace-nowrap">
                      {formatDate(assessment.taken_on)}
                    </td>
                    <td className="text-koyi-text py-3 pr-4">{assessment.administered_by}</td>
                    <td className="text-koyi-text py-3 pr-4 font-bold">{assessment.score}%</td>
                    <td className="py-3">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-1 text-xs font-bold',
                          BAND_CHIP_CLASS[assessment.band],
                        )}
                      >
                        {BAND_LABEL[assessment.band]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <Card title="Assessment History" icon={<HistoryIcon className="size-4" />}>
        {student.assessments.length === 0 ? (
          <p className="text-koyi-muted text-sm">Nothing recorded yet.</p>
        ) : (
          <ol className="border-koyi-border ml-2 space-y-5 border-l pl-5">
            {student.assessments.map((assessment, index) => (
              <li key={assessment.id} className="relative">
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute top-1 -left-6.75 size-3 rounded-full',
                    index === 0 ? 'bg-koyi-primary ring-koyi-nav-active ring-4' : 'bg-koyi-border',
                  )}
                />
                <p className="text-koyi-muted text-xs">{formatDate(assessment.taken_on)}</p>
                <p className="text-koyi-text mt-0.5 text-sm font-bold">
                  {BAND_LABEL[assessment.band]}
                </p>
                <p className="text-koyi-muted mt-1 text-xs">
                  {assessment.title} &middot; Avg: {assessment.score}%
                </p>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}

/**
 * Student profile (design reference page 38), plus the full list of sittings
 * and scores.
 *
 * Bands and levels are rendered exactly as the server returned them — no score
 * is turned into a band here.
 */
export function StudentDetailPage() {
  const { studentId = '' } = useParams();
  const detailQuery = useQuery(studentDetailQuery(studentId));

  return (
    <div className="space-y-6">
      <Link
        to={paths.schoolAdmin.students.list}
        className="text-koyi-primary inline-flex items-center gap-2 text-sm font-semibold"
      >
        <ArrowLeftIcon aria-hidden="true" className="size-4" />
        Back to Students
      </Link>

      {detailQuery.isPending && <PageSpinner />}

      {detailQuery.isError && (
        <ErrorState
          error={detailQuery.error}
          onRetry={() => {
            void detailQuery.refetch();
          }}
        />
      )}

      {detailQuery.data && <StudentProfile student={detailQuery.data} />}
    </div>
  );
}
