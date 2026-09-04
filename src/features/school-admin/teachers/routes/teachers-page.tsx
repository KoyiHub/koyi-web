import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { buttonClasses } from '@/components/ui/button-variants';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PlusIcon, UsersIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { paths } from '@/config/paths';
import { teacherListQuery } from '@/features/school-admin/teachers/api/queries';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { cn } from '@/lib/utils/cn';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
];

/**
 * Teacher roster (design reference page 10).
 *
 * Search and paging are server-side: the query key carries both, so a filtered
 * page is cached on its own rather than being sliced out of a full list the
 * browser had to download.
 */
export function TeachersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const listQuery = useQuery(teacherListQuery({ search: debouncedSearch, status, page }));
  const teachers = listQuery.data?.results ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers"
        subtitle="View and manage all teachers in your school."
        actions={
          <>
            <SearchInput
              value={search}
              label="Search teachers"
              placeholder="Search by name or teacher ID…"
              onChange={(value) => {
                setSearch(value);
                // A new query invalidates the current page number.
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
            <Link to={paths.schoolAdmin.teachers.new} className={cn(buttonClasses(), 'shrink-0')}>
              <PlusIcon aria-hidden="true" />
              Add Teacher
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
        (teachers.length === 0 ? (
          <EmptyState
            icon={<UsersIcon />}
            title={
              debouncedSearch ? `No teachers match "${debouncedSearch}".` : 'No teachers added yet.'
            }
            description="Search by a teacher's full name or their teacher ID."
          />
        ) : (
          <div className="rounded-koyi-xl border-koyi-border bg-koyi-card overflow-hidden border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-180 border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-koyi-nav-active text-koyi-muted text-xs tracking-wide uppercase">
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Teacher&rsquo;s Name
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Teacher&rsquo;s ID
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Class Assigned
                    </th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-koyi-border divide-y">
                  {teachers.map((teacher) => (
                    <tr key={teacher.id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <InitialsAvatar name={teacher.full_name} />
                          <div className="min-w-0">
                            <p className="text-koyi-text flex items-center gap-2 truncate font-bold">
                              {teacher.full_name}
                              {teacher.status === 'disabled' && (
                                <span className="bg-koyi-surface text-koyi-muted rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase">
                                  Disabled
                                </span>
                              )}
                            </p>
                            <p className="text-koyi-muted truncate text-xs">{teacher.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="text-koyi-text px-5 py-4">{teacher.teacher_id}</td>

                      <td className="px-5 py-4">
                        {teacher.class_assigned ? (
                          <span className="bg-koyi-band-intermediate-soft text-koyi-primary inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold">
                            {teacher.class_assigned}
                            {teacher.additional_class_count > 0 &&
                              ` +${String(teacher.additional_class_count)}`}
                          </span>
                        ) : (
                          <span className="text-koyi-muted text-xs">Not assigned</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          to={paths.schoolAdmin.teachers.detail(teacher.id)}
                          className="border-koyi-primary text-koyi-primary hover:bg-koyi-nav-active inline-flex h-9 items-center rounded-md border px-3 text-xs font-bold transition-colors"
                        >
                          View Details
                          <span className="sr-only"> for {teacher.full_name}</span>
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
                itemLabel="teachers"
                onPageChange={setPage}
              />
            </div>
          </div>
        ))}
    </div>
  );
}
