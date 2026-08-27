import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { buttonClasses } from '@/components/ui/button-variants';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import {
  ArrowLeftIcon,
  EyeIcon,
  GraduationCapIcon,
  PlusIcon,
  UsersIcon,
} from '@/components/ui/icons';
import { PageSpinner } from '@/components/ui/page-spinner';
import { paths } from '@/config/paths';
import { formatDate, LEVEL_CHIP_CLASS, LEVEL_LABEL } from '@/features/school-admin/api/format';
import type { ClassDetail } from '@/features/school-admin/classes/api/class.schema';
import { classDetailQuery } from '@/features/school-admin/classes/api/queries';
import { cn } from '@/lib/utils/cn';

function StatTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-koyi-sidebar rounded-koyi-md p-3">
      <p className="text-koyi-muted text-xs font-medium">{label}</p>
      <p
        className={cn(
          'font-display mt-0.5 text-xl font-extrabold',
          accent ? 'text-koyi-primary' : 'text-koyi-text',
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ClassOverview({ schoolClass }: { schoolClass: ClassDetail }) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="bg-koyi-nav-active border-transparent xl:col-span-2">
        <span className="bg-koyi-card text-koyi-primary inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold">
          <span aria-hidden="true" className="bg-koyi-primary size-1.5 rounded-full" />
          {schoolClass.grade_name}
        </span>

        <h1 className="text-koyi-text font-display mt-3 text-3xl font-extrabold">
          {schoolClass.display_name}
        </h1>
        <p className="text-koyi-muted mt-1 text-sm">
          {schoolClass.term} &middot; {schoolClass.room ?? 'No room assigned'} &middot; Created{' '}
          {formatDate(schoolClass.created_at)}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <StatTile label="Students" value={String(schoolClass.student_count)} />
          <StatTile label="Capacity" value={String(schoolClass.capacity)} />
          <StatTile label="Avg score" value={`${String(schoolClass.average_score)}%`} accent />
          <StatTile
            label="Literacy / Numeracy"
            value={`${String(schoolClass.literacy_score)}% / ${String(schoolClass.numeracy_score)}%`}
          />
        </div>
      </Card>

      <Card
        title="Teachers"
        subtitle="Everyone teaching this class."
        icon={<UsersIcon className="size-4" />}
      >
        {schoolClass.teachers.length === 0 ? (
          <p className="text-koyi-muted text-sm">No teacher assigned to this class yet.</p>
        ) : (
          <ul className="space-y-2">
            {schoolClass.teachers.map((teacher) => (
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
                    <span className="text-koyi-muted block truncate text-xs">
                      {teacher.email}
                      {teacher.is_form_teacher && ' · Form teacher'}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card
        title="Students"
        subtitle={`${String(schoolClass.student_count)} enrolled in ${schoolClass.display_name}.`}
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
        {schoolClass.students.length === 0 ? (
          <EmptyState
            icon={<GraduationCapIcon className="size-5" />}
            title="No students in this class yet."
            description="Enrol a student and assign them to this class."
          />
        ) : (
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
                <th scope="col" className="px-4 py-3 font-semibold">
                  Level
                </th>
                <th scope="col" className="rounded-r-md px-4 py-3 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-koyi-border divide-y">
              {schoolClass.students.map((student) => (
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
                  <td className="text-koyi-text px-4 py-3">{student.age}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-1 text-xs font-bold',
                        LEVEL_CHIP_CLASS[student.level],
                      )}
                    >
                      {LEVEL_LABEL[student.level]}
                    </span>
                  </td>
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
        )}
      </Card>
    </div>
  );
}

/** One class: its teachers and its enrolled students. */
export function ClassDetailPage() {
  const { classId = '' } = useParams();
  const detailQuery = useQuery(classDetailQuery(classId));

  return (
    <div className="space-y-6">
      <Link
        to={paths.schoolAdmin.classes.list}
        className="text-koyi-primary inline-flex items-center gap-2 text-sm font-semibold"
      >
        <ArrowLeftIcon aria-hidden="true" className="size-4" />
        Back to Classes
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

      {detailQuery.data && <ClassOverview schoolClass={detailQuery.data} />}
    </div>
  );
}
