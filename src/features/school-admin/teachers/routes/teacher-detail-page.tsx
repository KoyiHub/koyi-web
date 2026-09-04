import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import {
  ArrowLeftIcon,
  ClipboardIcon,
  KeyIcon,
  LayersIcon,
  TrashIcon,
  UserGroupIcon,
} from '@/components/ui/icons';
import { PageSpinner } from '@/components/ui/page-spinner';
import { paths } from '@/config/paths';
import {
  ASSESSMENT_STATUS_CLASS,
  ASSESSMENT_STATUS_LABEL,
  ASSESSMENT_TYPE_LABEL,
  formatDate,
  SUBJECT_LABEL,
} from '@/features/school-admin/api/format';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import {
  useDisableTeacher,
  useEnableTeacher,
} from '@/features/school-admin/teachers/api/mutations';
import { teacherDetailQuery } from '@/features/school-admin/teachers/api/queries';
import type {
  TeacherDetail,
  TeacherStatus,
} from '@/features/school-admin/teachers/api/teacher.schema';
import { DeleteTeacherModal } from '@/features/school-admin/teachers/components/delete-teacher-modal';
import { ResetPasswordModal } from '@/features/school-admin/teachers/components/reset-password-modal';
import { cn } from '@/lib/utils/cn';

const STATUS_LABEL: Record<TeacherStatus, string> = {
  active: 'Active',
  invited: 'Invited',
  suspended: 'Suspended',
  disabled: 'Disabled',
};

const STATUS_CLASS: Record<TeacherStatus, string> = {
  active: 'bg-koyi-band-strong-soft text-koyi-band-strong-ink',
  invited: 'bg-koyi-band-intermediate-soft text-koyi-primary',
  suspended: 'bg-koyi-band-struggling-soft text-koyi-band-struggling-ink',
  disabled: 'bg-koyi-surface text-koyi-muted',
};

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-koyi-sidebar border-koyi-border rounded-koyi-lg border p-4">
      <p className="text-koyi-muted text-xs font-medium">{label}</p>
      <p className="text-koyi-text font-display mt-1 text-xl font-extrabold">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="text-koyi-muted shrink-0 text-xs font-medium">{label}</dt>
      <dd className="text-koyi-text truncate text-sm font-semibold">{value}</dd>
    </div>
  );
}

function TeacherProfile({ teacher }: { teacher: TeacherDetail }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const disableTeacher = useDisableTeacher();
  const enableTeacher = useEnableTeacher();

  const isDisabled = teacher.status === 'disabled';

  return (
    <div className="space-y-6">
      <Card className="bg-koyi-nav-active border-transparent">
        <div className="flex flex-wrap items-center gap-5">
          <InitialsAvatar name={teacher.full_name} className="size-16 text-lg" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-koyi-text font-display text-2xl font-extrabold">
                {teacher.full_name}
              </h1>
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-bold',
                  STATUS_CLASS[teacher.status],
                )}
              >
                {STATUS_LABEL[teacher.status]}
              </span>
            </div>
            <p className="text-koyi-muted mt-1 text-sm">{teacher.email}</p>
            <p className="text-koyi-muted text-xs">
              {teacher.teacher_id} &middot; Joined {formatDate(teacher.date_joined)}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setResetOpen(true);
              }}
              className="border-koyi-primary text-koyi-primary hover:bg-koyi-card inline-flex h-11 items-center gap-2 rounded-md border bg-white/70 px-4 text-sm font-bold transition-colors"
            >
              <KeyIcon aria-hidden="true" className="size-4" />
              Reset Password
            </button>

            <Button
              variant="secondary"
              isLoading={isDisabled ? enableTeacher.isPending : disableTeacher.isPending}
              onClick={() => {
                if (isDisabled) {
                  enableTeacher.mutate(teacher.id);
                } else {
                  disableTeacher.mutate(teacher.id);
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

      {deleteOpen && (
        <DeleteTeacherModal
          teacherId={teacher.id}
          teacherName={teacher.full_name}
          onClose={() => {
            setDeleteOpen(false);
          }}
          onDeleted={() => {
            void queryClient.invalidateQueries({ queryKey: schoolAdminKeys.teachers() });
            void navigate(paths.schoolAdmin.teachers.list);
          }}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Assessments created" value={String(teacher.stats.assessments_created)} />
        <StatTile label="Classes assigned" value={String(teacher.stats.classes_assigned)} />
        <StatTile label="Students reached" value={String(teacher.stats.students_reached)} />
        <StatTile
          label="Average class score"
          value={
            teacher.stats.average_class_score === null
              ? '—'
              : `${String(teacher.stats.average_class_score)}%`
          }
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card
          title="Assessments created"
          subtitle="Authored by this teacher, newest first."
          icon={<ClipboardIcon className="size-4" />}
          className="xl:col-span-2"
          bodyClassName="overflow-x-auto"
        >
          {teacher.assessments.length === 0 ? (
            <EmptyState
              icon={<ClipboardIcon />}
              title="No assessments yet."
              description="Assessments this teacher creates will be listed here."
            />
          ) : (
            <table className="w-full min-w-160 border-collapse text-left text-sm">
              <thead>
                <tr className="text-koyi-muted border-koyi-border border-b text-xs">
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Assessment
                  </th>
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Class
                  </th>
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Questions
                  </th>
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Completion
                  </th>
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Avg. score
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-koyi-border divide-y">
                {teacher.assessments.map((assessment) => (
                  <tr key={assessment.id}>
                    <td className="py-3 pr-4">
                      <p className="text-koyi-text font-bold">{assessment.title}</p>
                      <p className="text-koyi-muted text-xs">
                        {SUBJECT_LABEL[assessment.subject]} &middot;{' '}
                        {ASSESSMENT_TYPE_LABEL[assessment.assessment_type]} &middot;{' '}
                        {assessment.duration_minutes} min &middot; created{' '}
                        {formatDate(assessment.created_at)}
                      </p>
                    </td>
                    <td className="text-koyi-text py-3 pr-4 whitespace-nowrap">
                      {assessment.class_name}
                    </td>
                    <td className="text-koyi-text py-3 pr-4">{assessment.question_count}</td>
                    <td className="text-koyi-text py-3 pr-4 whitespace-nowrap">
                      {assessment.students_completed}/{assessment.students_assigned}
                    </td>
                    <td className="text-koyi-text py-3 pr-4">
                      {assessment.average_score === null
                        ? '—'
                        : `${String(assessment.average_score)}%`}
                    </td>
                    <td className="py-3">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap',
                          ASSESSMENT_STATUS_CLASS[assessment.status],
                        )}
                      >
                        {ASSESSMENT_STATUS_LABEL[assessment.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <div className="space-y-4">
          <Card title="Classes" icon={<LayersIcon className="size-4" />}>
            {teacher.classes.length === 0 ? (
              <p className="text-koyi-muted text-sm">Not assigned to a class yet.</p>
            ) : (
              <ul className="space-y-2">
                {teacher.classes.map((teacherClass) => (
                  <li key={teacherClass.class_id}>
                    <Link
                      to={paths.schoolAdmin.classes.detail(teacherClass.class_id)}
                      className="border-koyi-border hover:bg-koyi-sidebar flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 transition-colors"
                    >
                      <span className="min-w-0">
                        <span className="text-koyi-text block truncate text-sm font-bold">
                          {teacherClass.grade_name} &middot; {teacherClass.class_name}
                        </span>
                        <span className="text-koyi-muted block text-xs">
                          {teacherClass.student_count} students
                          {teacherClass.is_form_teacher && ' · Form teacher'}
                        </span>
                      </span>
                      <UserGroupIcon
                        aria-hidden="true"
                        className="text-koyi-muted size-4 shrink-0"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Profile">
            <dl className="divide-koyi-border divide-y">
              <DetailRow label="Phone" value={teacher.phone} />
              <DetailRow label="Qualification" value={teacher.qualification} />
              <DetailRow
                label="Subjects"
                value={teacher.subjects.length > 0 ? teacher.subjects.join(', ') : '—'}
              />
              <DetailRow label="Last login" value={formatDate(teacher.last_login)} />
            </dl>
          </Card>
        </div>
      </div>

      {resetOpen && (
        <ResetPasswordModal
          teacherId={teacher.id}
          teacherName={teacher.full_name}
          onClose={() => {
            setResetOpen(false);
          }}
        />
      )}
    </div>
  );
}

/**
 * Teacher profile: identity, workload stats, the assessments they authored and
 * the classes they cover, plus the password reset action.
 *
 * No image was provided for this screen, so it follows the card language the
 * rest of the School Admin section uses.
 */
export function TeacherDetailPage() {
  const { teacherId = '' } = useParams();
  const detailQuery = useQuery(teacherDetailQuery(teacherId));

  return (
    <div className="space-y-6">
      <Link
        to={paths.schoolAdmin.teachers.list}
        className="text-koyi-primary inline-flex items-center gap-2 text-sm font-semibold"
      >
        <ArrowLeftIcon aria-hidden="true" className="size-4" />
        Back to Teachers
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

      {detailQuery.data && <TeacherProfile teacher={detailQuery.data} />}
    </div>
  );
}
