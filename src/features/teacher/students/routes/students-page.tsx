import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ArrowRightIcon, UsersIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { paths } from '@/config/paths';
import { DataTable } from '@/features/teacher/components/data-table';
import { studentListQuery } from '@/features/teacher/students/api/queries';

const COLUMNS = [
  { key: 'student', label: 'Student' },
  { key: 'class', label: 'Class' },
  { key: 'open', label: 'Open profile', align: 'right' as const, labelHidden: true },
];

/**
 * The class roster — `frontend-integration.md` §5.6. A slim shape: no
 * level, score or gap here — those live on `/skills/` (per child) and
 * `/analytics/roster/` (per assessment). A teacher manages a lesson, not
 * the enrolment record.
 */
export function StudentsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const students = useQuery(studentListQuery({ page }));
  const term = search.trim().toLowerCase();
  const rows = (students.data?.results ?? []).filter(
    (student) =>
      !term ||
      student.full_name.toLowerCase().includes(term) ||
      student.student_id.toLowerCase().includes(term),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        subtitle="Every child in your class."
        actions={
          <SearchInput
            label="Search students"
            placeholder="Search by name or student ID"
            value={search}
            onChange={setSearch}
            className="w-full sm:w-72"
          />
        }
      />

      {students.isPending && <PageSpinner />}

      {students.isError && (
        <ErrorState
          error={students.error}
          onRetry={() => {
            void students.refetch();
          }}
        />
      )}

      {students.data && rows.length === 0 && (
        <EmptyState
          icon={<UsersIcon className="size-6" />}
          title="No children match"
          description="Clear the search to see your whole class."
        />
      )}

      {students.data && rows.length > 0 && (
        <Card bodyClassName="pt-2">
          <DataTable caption="Class roster" columns={COLUMNS}>
            {rows.map((student) => (
              <tr key={student.id} className="hover:bg-koyi-surface/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <InitialsAvatar name={student.full_name} />
                    <div className="min-w-0">
                      <p className="text-koyi-text truncate font-bold">{student.full_name}</p>
                      <p className="text-koyi-muted text-xs">{student.student_id}</p>
                    </div>
                  </div>
                </td>

                <td className="text-koyi-text px-5 py-3">{student.school_class}</td>

                <td className="px-5 py-3 text-right">
                  <Link
                    // Every row's visible label reads "Profile", so the row's
                    // child is named here for anyone listening rather than looking.
                    aria-label={`Profile for ${student.full_name}`}
                    to={paths.teacher.students.detail(student.id)}
                    className="text-koyi-primary focus-visible:outline-koyi-primary inline-flex items-center gap-1 text-sm font-bold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    Profile
                    <ArrowRightIcon aria-hidden="true" className="size-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </DataTable>

          <Pagination
            page={students.data.page}
            pageCount={students.data.num_pages}
            onPageChange={setPage}
            totalCount={students.data.count}
            pageSize={students.data.page_size}
            itemLabel="students"
            className="mt-4"
          />
        </Card>
      )}
    </div>
  );
}
