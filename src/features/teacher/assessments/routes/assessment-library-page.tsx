import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';

import { buttonClasses } from '@/components/ui/button-variants';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { BookOpenIcon, PlusIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { paths } from '@/config/paths';
import { assessmentsQuery } from '@/features/teacher/assessments/api/queries';
import { ASSESSMENT_STATUS_CLASS, ASSESSMENT_STATUS_LABEL, formatDate } from '@/lib/api/format';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';

/**
 * The assessment library — `frontend-integration.md` §7.4: "Keep. Show
 * `status` and `code` per row."
 *
 * No term or grade framing here (§9): a row shows its status, its code once
 * published, and how many sections and questions it holds — nothing scored.
 */
export function AssessmentLibraryPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const assessments = useQuery(assessmentsQuery({ search: debouncedSearch || undefined, page }));

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <PageHeader
        title="Assessments"
        subtitle="Every paper this school's teachers have built — draft, published, open or closed."
        actions={
          <Link to={paths.teacher.assessments.create} className={buttonClasses()}>
            <PlusIcon className="size-4" />
            New assessment
          </Link>
        }
      />

      <SearchInput label="Search assessments" value={search} onChange={setSearch} />

      {assessments.isPending && <PageSpinner />}
      {assessments.isError && (
        <ErrorState error={assessments.error} onRetry={() => void assessments.refetch()} />
      )}

      {assessments.data?.results.length === 0 && (
        <EmptyState
          icon={<BookOpenIcon className="size-6" />}
          title="No assessments yet"
          description="Build one to start diagnosing where each child actually is."
          action={
            <Link to={paths.teacher.assessments.create} className={buttonClasses()}>
              New assessment
            </Link>
          }
        />
      )}

      {assessments.data && assessments.data.results.length > 0 && (
        <div className="border-koyi-border rounded-koyi-md divide-koyi-border divide-y border">
          {assessments.data.results.map((assessment) => (
            <Link
              key={assessment.id}
              to={paths.teacher.assessments.detail(assessment.id)}
              className="hover:bg-koyi-surface flex items-center justify-between gap-4 p-4"
            >
              <div>
                <p className="text-koyi-text text-sm font-medium">{assessment.name}</p>
                <p className="text-koyi-muted mt-0.5 text-xs">
                  {assessment.sections.length} section{assessment.sections.length === 1 ? '' : 's'}
                  {assessment.code && ` · Code ${assessment.code}`} · Created{' '}
                  {formatDate(assessment.created_at)}
                </p>
              </div>
              <span
                className={`rounded-koyi-sm px-2.5 py-1 text-xs font-semibold ${ASSESSMENT_STATUS_CLASS[assessment.status]}`}
              >
                {ASSESSMENT_STATUS_LABEL[assessment.status]}
              </span>
            </Link>
          ))}
        </div>
      )}

      {assessments.data && (
        <Pagination
          page={assessments.data.page}
          pageCount={assessments.data.num_pages}
          onPageChange={setPage}
          totalCount={assessments.data.count}
          pageSize={assessments.data.page_size}
          itemLabel="assessments"
        />
      )}
    </div>
  );
}
