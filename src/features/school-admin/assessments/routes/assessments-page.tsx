import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ClipboardIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { Pagination } from '@/components/ui/pagination';
import { schoolAssessmentListQuery } from '@/features/school-admin/assessments/api/queries';
import { ASSESSMENT_STATUS_CLASS, ASSESSMENT_STATUS_LABEL, formatDate } from '@/lib/api/format';
import { cn } from '@/lib/utils/cn';

/**
 * School-wide assessment oversight — `frontend-integration.md` §4.8. School
 * management doesn't author papers itself, that stays a teacher's job, but
 * needs to see every one of them across every teacher to know what's
 * running. A simple paginated list — the doc doesn't extend a detail view,
 * and per-paper analytics stays the teacher-side endpoint (§5.5).
 */
export function SchoolAssessmentsPage() {
  const [page, setPage] = useState(1);
  const listQuery = useQuery(schoolAssessmentListQuery({ page }));
  const rows = listQuery.data?.results ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Assessments" subtitle="Every assessment running across the school." />

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
        (rows.length === 0 ? (
          <EmptyState
            icon={<ClipboardIcon />}
            title="No assessments yet."
            description="Assessments teachers create will be listed here."
          />
        ) : (
          <div className="rounded-koyi-xl border-koyi-border bg-koyi-card overflow-hidden border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-180 border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-koyi-nav-active text-koyi-muted text-xs tracking-wide uppercase">
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Assessment
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Teacher
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Code
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Assigned / Graded
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-koyi-border divide-y">
                  {rows.map((assessment) => (
                    <tr key={assessment.id}>
                      <td className="px-5 py-4">
                        <p className="text-koyi-text font-bold">{assessment.name}</p>
                        <p className="text-koyi-muted text-xs">
                          Created {formatDate(assessment.created_at)}
                        </p>
                      </td>
                      <td className="text-koyi-text px-5 py-4">
                        {assessment.teacher_name ?? (
                          <span className="text-koyi-muted italic">Removed</span>
                        )}
                      </td>
                      <td className="text-koyi-text px-5 py-4 font-mono whitespace-nowrap">
                        {assessment.code}
                      </td>
                      <td className="text-koyi-text px-5 py-4 whitespace-nowrap">
                        {assessment.assigned_count} / {assessment.graded_count}
                      </td>
                      <td className="px-5 py-4">
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
            </div>

            <div className="border-koyi-border border-t px-5 py-4">
              <Pagination
                page={listQuery.data.page}
                pageCount={listQuery.data.num_pages}
                totalCount={listQuery.data.count}
                pageSize={listQuery.data.page_size}
                itemLabel="assessments"
                onPageChange={setPage}
              />
            </div>
          </div>
        ))}
    </div>
  );
}
