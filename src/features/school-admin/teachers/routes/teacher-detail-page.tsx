import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { ArrowLeftIcon, KeyIcon, LayersIcon, TrashIcon } from '@/components/ui/icons';
import { PageSpinner } from '@/components/ui/page-spinner';
import { paths } from '@/config/paths';
import { formatDate } from '@/features/school-admin/api/format';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import {
  useDisableTeacher,
  useEnableTeacher,
} from '@/features/school-admin/teachers/api/mutations';
import { teacherDetailQuery } from '@/features/school-admin/teachers/api/queries';
import type { Teacher } from '@/features/school-admin/teachers/api/teacher.schema';
import { DeleteTeacherModal } from '@/features/school-admin/teachers/components/delete-teacher-modal';
import { ResetPasswordModal } from '@/features/school-admin/teachers/components/reset-password-modal';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="text-koyi-muted shrink-0 text-xs font-medium">{label}</dt>
      <dd className="text-koyi-text truncate text-sm font-semibold">{value}</dd>
    </div>
  );
}

function TeacherProfile({ teacher }: { teacher: Teacher }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const disableTeacher = useDisableTeacher();
  const enableTeacher = useEnableTeacher();

  const isDisabled = !teacher.is_active;

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
                className={
                  isDisabled
                    ? 'bg-koyi-surface text-koyi-muted rounded-full px-3 py-1 text-xs font-bold'
                    : 'bg-koyi-band-strong-soft text-koyi-band-strong-ink rounded-full px-3 py-1 text-xs font-bold'
                }
              >
                {isDisabled ? 'Disabled' : 'Active'}
              </span>
            </div>
            <p className="text-koyi-muted mt-1 text-sm">{teacher.email}</p>
            <p className="text-koyi-muted text-xs">
              {teacher.teacher_id} &middot; Joined {formatDate(teacher.created_at)}
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

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Class" icon={<LayersIcon className="size-4" />}>
          {teacher.school_class ? (
            <Link
              to={paths.schoolAdmin.classes.detail(teacher.school_class.id)}
              className="border-koyi-border hover:bg-koyi-sidebar flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 transition-colors"
            >
              <span className="text-koyi-text text-sm font-bold">{teacher.school_class.label}</span>
            </Link>
          ) : (
            <p className="text-koyi-muted text-sm">Not assigned to a class yet.</p>
          )}
        </Card>

        <Card title="Profile">
          <dl className="divide-koyi-border divide-y">
            <DetailRow label="Teacher ID" value={teacher.teacher_id} />
            <DetailRow label="Last updated" value={formatDate(teacher.updated_at)} />
          </dl>
        </Card>
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
 * Teacher profile — `frontend-integration.md` §4.4. Identity, the one class
 * this teacher covers, and the disable/enable, password-reset and two-step
 * delete actions. Workload stats and an authored-assessments table have no
 * doc anchor and were dropped, not kept alongside — see
 * `refactor-plan.md`'s contract-realignment writeup.
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
