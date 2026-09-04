import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { ArrowLeftIcon, BarChartIcon, CalendarIcon, TrashIcon } from '@/components/ui/icons';
import { PageSpinner } from '@/components/ui/page-spinner';
import { paths } from '@/config/paths';
import { formatDate } from '@/features/school-admin/api/format';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import {
  useDisableStudent,
  useEnableStudent,
} from '@/features/school-admin/students/api/mutations';
import { studentDetailQuery, studentFlnQuery } from '@/features/school-admin/students/api/queries';
import type { StudentDetail } from '@/features/school-admin/students/api/student.schema';
import { DeleteStudentModal } from '@/features/school-admin/students/components/delete-student-modal';
import { ApiError } from '@/lib/api/errors';
import { ASSIGNMENT_STATUS_LABEL } from '@/lib/api/format';
import { domainLevelLabel } from '@/lib/fln/level';

/**
 * The FLN panel — `frontend-integration.md` §4.5's `/fln/` endpoint. Two
 * independent levels, side by side, never combined (§9); a student who
 * hasn't sat anything yet gets a plain "not yet assessed" state rather than
 * a guessed-at null-heavy shape.
 */
function FlnPanel({ studentId }: { studentId: string }) {
  const fln = useQuery(studentFlnQuery(studentId));

  if (fln.isPending) return <PageSpinner />;

  if (fln.isError) {
    if (fln.error instanceof ApiError && fln.error.isNotFound) {
      return (
        <Card title="Foundational Literacy & Numeracy" icon={<BarChartIcon className="size-4" />}>
          <p className="text-koyi-muted text-sm">
            Not yet assessed. Levels and recent results will appear here once this child has sat an
            assessment.
          </p>
        </Card>
      );
    }
    return <ErrorState error={fln.error} onRetry={() => void fln.refetch()} />;
  }

  const data = fln.data;

  return (
    <Card
      title="Foundational Literacy & Numeracy"
      icon={<BarChartIcon className="size-4" />}
      action={
        data.last_assessed_at && (
          <span className="bg-koyi-nav-active text-koyi-text inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
            <CalendarIcon aria-hidden="true" className="size-3.5" />
            Last assessed {formatDate(data.last_assessed_at)}
          </span>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-koyi-sidebar border-koyi-border rounded-koyi-lg border p-4">
          <p className="text-koyi-muted text-xs font-medium">Literacy</p>
          <p className="text-koyi-primary font-display mt-1 text-lg font-extrabold">
            {domainLevelLabel('literacy', data.literacy_level)}
          </p>
        </div>
        <div className="bg-koyi-sidebar border-koyi-border rounded-koyi-lg border p-4">
          <p className="text-koyi-muted text-xs font-medium">Numeracy</p>
          <p className="text-koyi-primary font-display mt-1 text-lg font-extrabold">
            {domainLevelLabel('numeracy', data.numeracy_level)}
          </p>
        </div>
      </div>

      {data.recent_results.length > 0 && (
        <div className="mt-5">
          <p className="text-koyi-muted mb-2 text-xs font-bold uppercase">Recent results</p>
          <ul className="divide-koyi-border divide-y text-sm">
            {data.recent_results.map((result) => (
              <li
                key={`${result.assessment}-${result.date}`}
                className="flex items-center justify-between gap-3 py-2"
              >
                <span className="text-koyi-text min-w-0 truncate font-semibold">
                  {result.assessment}
                </span>
                <span className="text-koyi-muted shrink-0 text-xs">
                  {formatDate(result.date)} ·{' '}
                  {ASSIGNMENT_STATUS_LABEL[result.status] ?? result.status} · {result.percentage}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

function StudentProfile({ student }: { student: StudentDetail }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const disableStudent = useDisableStudent();
  const enableStudent = useEnableStudent();
  const isDisabled = student.status === 'disabled';

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="bg-koyi-nav-active border-transparent xl:col-span-2">
        <div className="flex flex-wrap items-center gap-5">
          <InitialsAvatar name={student.full_name} className="size-20 text-xl" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-koyi-text font-display text-3xl font-extrabold">
                {student.full_name}
              </h1>
              {isDisabled && (
                <span className="bg-koyi-surface text-koyi-muted rounded-full px-3 py-1 text-xs font-bold">
                  Disabled
                </span>
              )}
            </div>
            <p className="text-koyi-muted mt-1 text-sm">
              {student.class_name} &middot; Student ID: {student.student_id}
            </p>
            <p className="text-koyi-muted mt-1 text-xs">Age: {student.age} yrs</p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              variant="secondary"
              isLoading={isDisabled ? enableStudent.isPending : disableStudent.isPending}
              onClick={() => {
                if (isDisabled) {
                  enableStudent.mutate(student.id);
                } else {
                  disableStudent.mutate(student.id);
                }
              }}
            >
              {isDisabled ? 'Enable' : 'Disable'}
            </Button>
            <Button
              variant="secondary"
              className="text-koyi-danger"
              onClick={() => {
                setDeleteOpen(true);
              }}
            >
              <TrashIcon aria-hidden="true" className="size-4" />
              Delete
            </Button>
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
            <dt className="text-koyi-muted text-xs font-medium">Email</dt>
            <dd className="text-koyi-text truncate font-semibold">
              {student.guardian.email ?? '—'}
            </dd>
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

      <div className="xl:col-span-3">
        <FlnPanel studentId={student.id} />
      </div>

      {deleteOpen && (
        <DeleteStudentModal
          studentId={student.id}
          studentName={student.full_name}
          onClose={() => {
            setDeleteOpen(false);
          }}
          onDeleted={() => {
            void queryClient.invalidateQueries({ queryKey: schoolAdminKeys.students() });
            void navigate(paths.schoolAdmin.students.list);
          }}
        />
      )}
    </div>
  );
}

/**
 * Student profile — `frontend-integration.md` §4.5. Levels, scores and
 * recent results come from the dedicated `/fln/` endpoint, not embedded in
 * the base record — the old score-first block (a single band, "strengths"/
 * "learning gaps", a full assessment history table) is gone outright, not
 * kept alongside.
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
