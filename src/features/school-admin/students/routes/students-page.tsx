import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { buttonClasses } from '@/components/ui/button-variants';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { EyeIcon, PlusIcon, UserGroupIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { paths } from '@/config/paths';
import { ageFromDob } from '@/features/school-admin/api/format';
import { studentListQuery } from '@/features/school-admin/students/api/queries';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { cn } from '@/lib/utils/cn';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
];

/**
 * Student roster — `frontend-integration.md` §4.5.
 *
 * Students carry no email — they have no login of their own — so the name
 * cell shows the name alone, unlike the teacher table. §4.5's documented
 * filters are `?search=&school_class=` only — no `?is_active=` — so the
 * active/disabled filter here is applied client-side over the fetched page
 * rather than sending an undocumented query param.
 */
export function StudentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const listQuery = useQuery(
    studentListQuery({ search: debouncedSearch, page, schoolClass: 'all' }),
  );
  const students = (listQuery.data?.results ?? []).filter((student) => {
    if (status === 'active') return student.is_active;
    if (status === 'disabled') return !student.is_active;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        subtitle="View and manage all students in your school."
        actions={
          <>
            <SearchInput
              value={search}
              label="Search students"
              placeholder="Search by name or student ID…"
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
            />
            <SegmentedControl
              label="Filter by status"
              value={status}
              options={STATUS_OPTIONS}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            />
            <Link
              to={paths.schoolAdmin.students.transfer}
              className={cn(buttonClasses('secondary'), 'shrink-0')}
            >
              Transfer Students
            </Link>
            <Link to={paths.schoolAdmin.students.new} className={cn(buttonClasses(), 'shrink-0')}>
              <PlusIcon aria-hidden="true" />
              Add Student
            </Link>
          </>
        }
      />

      {listQuery.isPending && <PageSpinner />}

      {listQuery.isError && (
        <ErrorState
          error={listQuery.error}
          onRetry={() => {
            void listQuery.refetch();
          }}
        />
      )}

      {listQuery.data &&
        (students.length === 0 ? (
          <EmptyState
            icon={<UserGroupIcon />}
            title={
              debouncedSearch
                ? `No students match "${debouncedSearch}".`
                : 'No students enrolled yet.'
            }
            description="Search by a student's full name or their student ID."
          />
        ) : (
          <div className="rounded-koyi-xl border-koyi-border bg-koyi-card overflow-hidden border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-180 border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-koyi-nav-active text-koyi-muted text-xs font-semibold">
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Name
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Student ID
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Age
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Class
                    </th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-koyi-border divide-y">
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <InitialsAvatar name={student.full_name} />
                          <p className="text-koyi-text flex items-center gap-2 truncate font-bold">
                            {student.full_name}
                            {!student.is_active && (
                              <span className="bg-koyi-surface text-koyi-muted rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase">
                                Disabled
                              </span>
                            )}
                          </p>
                        </div>
                      </td>

                      <td className="text-koyi-text px-5 py-4">{student.student_id}</td>
                      <td className="text-koyi-text px-5 py-4">
                        {ageFromDob(student.date_of_birth)}
                      </td>

                      <td className="px-5 py-4">
                        {student.school_class ? (
                          <span className="bg-koyi-band-intermediate-soft text-koyi-primary inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold">
                            {student.school_class.label}
                          </span>
                        ) : (
                          <span className="text-koyi-muted text-xs">Not assigned</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          to={paths.schoolAdmin.students.detail(student.id)}
                          className="border-koyi-primary text-koyi-primary hover:bg-koyi-nav-active inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-bold transition-colors"
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
            </div>

            <div className="border-koyi-border border-t px-5 py-4">
              <Pagination
                page={listQuery.data.page}
                pageCount={listQuery.data.num_pages}
                totalCount={listQuery.data.count}
                pageSize={listQuery.data.page_size}
                itemLabel="students"
                onPageChange={setPage}
              />
            </div>
          </div>
        ))}
    </div>
  );
}
