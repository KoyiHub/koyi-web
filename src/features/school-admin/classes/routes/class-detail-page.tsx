import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { buttonClasses } from '@/components/ui/button-variants';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import {
  ArrowLeftIcon,
  EyeIcon,
  GraduationCapIcon,
  PlusIcon,
  TrashIcon,
  UsersIcon,
} from '@/components/ui/icons';
import { PageSpinner } from '@/components/ui/page-spinner';
import { Pagination } from '@/components/ui/pagination';
import { paths } from '@/config/paths';
import { ageFromDob } from '@/features/school-admin/api/format';
import type { SchoolClass } from '@/features/school-admin/classes/api/class.schema';
import { useDeleteClass } from '@/features/school-admin/classes/api/mutations';
import { classListQuery } from '@/features/school-admin/classes/api/queries';
import { studentListQuery } from '@/features/school-admin/students/api/queries';
import { teacherListQuery } from '@/features/school-admin/teachers/api/queries';
import { ApiError } from '@/lib/api/errors';

function TeachersPanel({ classId }: { classId: string }) {
  const teachers = useQuery(teacherListQuery({ search: '', schoolClass: classId, page: 1 }));
  const rows = teachers.data?.results ?? [];

  return (
    <Card
      title="Teachers"
      subtitle="Everyone teaching this class."
      icon={<UsersIcon className="size-4" />}
    >
      {rows.length === 0 ? (
        <p className="text-koyi-muted text-sm">No teacher assigned to this class yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((teacher) => (
            <li key={teacher.id}>
              <Link
                to={paths.schoolAdmin.teachers.detail(teacher.id)}
                className="hover:bg-koyi-sidebar flex items-center gap-3 rounded-md px-2 py-2"
              >
                <InitialsAvatar name={teacher.full_name} className="size-9 text-xs" />
                <span className="min-w-0">
                  <span className="text-koyi-text block truncate text-sm font-bold">
                    {teacher.full_name}
                  </span>
                  <span className="text-koyi-muted block truncate text-xs">{teacher.email}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function StudentsPanel({ classId, className }: { classId: string; className: string }) {
  const [page, setPage] = useState(1);
  const students = useQuery(studentListQuery({ search: '', page, schoolClass: classId }));
  const rows = students.data?.results ?? [];

  return (
    <Card
      title="Students"
      subtitle={students.data ? `${String(students.data.count)} enrolled in ${className}.` : ''}
      icon={<GraduationCapIcon className="size-4" />}
      className="xl:col-span-3"
      bodyClassName="overflow-x-auto"
      action={
        <Link to={paths.schoolAdmin.students.new} className={buttonClasses('secondary', 'sm')}>
          <PlusIcon aria-hidden="true" className="size-4" />
          Add Student
        </Link>
      }
    >
      {rows.length === 0 ? (
        <EmptyState
          icon={<GraduationCapIcon className="size-5" />}
          title="No students in this class yet."
          description="Enrol a student and assign them to this class."
        />
      ) : (
        <>
          <table className="w-full min-w-160 border-collapse text-left text-sm">
            <thead>
              <tr className="bg-koyi-nav-active text-koyi-muted text-xs">
                <th scope="col" className="rounded-l-md px-4 py-3 font-semibold">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Student ID
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Age
                </th>
                <th scope="col" className="rounded-r-md px-4 py-3 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-koyi-border divide-y">
              {rows.map((student) => (
                <tr key={student.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={student.full_name} className="size-9 text-xs" />
                      <span className="text-koyi-text font-bold">{student.full_name}</span>
                    </div>
                  </td>
                  <td className="text-koyi-text px-4 py-3 whitespace-nowrap">
                    {student.student_id}
                  </td>
                  <td className="text-koyi-text px-4 py-3">{ageFromDob(student.date_of_birth)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={paths.schoolAdmin.students.detail(student.id)}
                      className={buttonClasses('secondary', 'sm')}
                    >
                      <EyeIcon aria-hidden="true" className="size-4" />
                      View Details
                      <span className="sr-only"> for {student.full_name}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {students.data && (
            <div className="pt-4">
              <Pagination
                page={students.data.page}
                pageCount={students.data.num_pages}
                totalCount={students.data.count}
                pageSize={students.data.page_size}
                itemLabel="students"
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function ClassOverview({ schoolClass }: { schoolClass: SchoolClass }) {
  const navigate = useNavigate();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteClass = useDeleteClass();

  function handleDelete() {
    setDeleteError(null);
    deleteClass.mutate(schoolClass.id, {
      onSuccess: () => {
        void navigate(paths.schoolAdmin.classes.list);
      },
      onError: (error) => {
        setDeleteError(error instanceof ApiError ? error.message : 'Could not delete this class.');
      },
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="bg-koyi-nav-active border-transparent xl:col-span-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <span className="bg-koyi-card text-koyi-primary inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold">
            <span aria-hidden="true" className="bg-koyi-primary size-1.5 rounded-full" />
            {schoolClass.grade_name}
          </span>

          <Button
            variant="secondary"
            className="text-koyi-danger"
            isLoading={deleteClass.isPending}
            onClick={handleDelete}
          >
            <TrashIcon aria-hidden="true" className="size-4" />
            Delete class
          </Button>
        </div>

        <h1 className="text-koyi-text font-display mt-3 text-3xl font-extrabold">
          {schoolClass.name}
        </h1>

        {deleteError && (
          <p role="alert" className="bg-koyi-card text-koyi-danger mt-4 rounded-md p-3 text-sm">
            {deleteError}{' '}
            <Link
              to={paths.schoolAdmin.students.transfer}
              className="font-semibold underline underline-offset-2"
            >
              Transfer these students first →
            </Link>
          </p>
        )}
      </Card>

      <TeachersPanel classId={schoolClass.id} />
      <StudentsPanel classId={schoolClass.id} className={schoolClass.label} />
    </div>
  );
}

/**
 * One class — `frontend-integration.md` §4.3. There is no `GET .../{id}/`
 * detail endpoint, so the class itself is looked up from the (small,
 * unpaginated) class list already in cache; its teachers and students are
 * two separate paginated lists filtered by `?school_class=` (§4.4, §4.5)
 * rather than a nested detail payload — `capacity`, `room`, `average_score`
 * and the literacy/numeracy scores this page used to show have no doc
 * anchor and are gone, not kept alongside.
 */
export function ClassDetailPage() {
  const { classId = '' } = useParams();
  const classesQuery = useQuery(classListQuery('all'));
  const schoolClass = classesQuery.data?.find((entry) => entry.id === classId);

  return (
    <div className="space-y-6">
      <Link
        to={paths.schoolAdmin.classes.list}
        className="text-koyi-primary inline-flex items-center gap-2 text-sm font-semibold"
      >
        <ArrowLeftIcon aria-hidden="true" className="size-4" />
        Back to Classes
      </Link>

      {classesQuery.isPending && <PageSpinner />}

      {classesQuery.isError && (
        <ErrorState
          error={classesQuery.error}
          onRetry={() => {
            void classesQuery.refetch();
          }}
        />
      )}

      {classesQuery.data && !schoolClass && (
        <EmptyState
          icon={<GraduationCapIcon className="size-5" />}
          title="We could not find that class."
          description="It may have been deleted."
        />
      )}

      {schoolClass && <ClassOverview schoolClass={schoolClass} />}
    </div>
  );
}
