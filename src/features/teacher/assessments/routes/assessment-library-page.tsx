import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { buttonClasses } from '@/components/ui/button-variants';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ClipboardIcon, ClockIcon, FilterIcon, PlusIcon, UsersIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { type SegmentedOption, UnderlineTabs } from '@/components/ui/segmented-control';
import { SelectField } from '@/components/ui/select-field';
import { paths } from '@/config/paths';
import {
  ASSESSMENT_STATUS_CLASS,
  ASSESSMENT_STATUS_LABEL,
  DIFFICULTY_CHIP_CLASS,
  DIFFICULTY_LABEL,
  SUBJECT_LABEL,
} from '@/features/teacher/api/format';
import type { AssessmentSummary } from '@/features/teacher/assessments/api/assessment.schema';
import { assessmentListQuery } from '@/features/teacher/assessments/api/queries';
import { AssessmentFilterModal } from '@/features/teacher/assessments/components/assessment-filter-modal';
import {
  activeFilterCount,
  type AssessmentFilters,
  DIFFICULTY_OPTIONS,
  NO_FILTERS,
} from '@/features/teacher/assessments/lib/filters';
import { cn } from '@/lib/utils/cn';

type Tab = 'all' | 'literacy' | 'numeracy' | 'drafts';

/**
 * One assessment in the library.
 *
 * The whole card is the link. The pills say what it is; the footer says where
 * it has got to — a draft shows its question count, an assigned one shows how
 * many children have finished, because those are different questions.
 */
function AssessmentCard({ assessment }: { assessment: AssessmentSummary }) {
  const isLive = assessment.status !== 'draft';

  return (
    <li>
      <Link
        to={paths.teacher.assessments.detail(assessment.id)}
        className="rounded-koyi-xl border-koyi-border bg-koyi-card hover:border-koyi-primary focus-visible:outline-koyi-primary flex h-full flex-col border p-5 transition-colors hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-koyi-surface text-koyi-muted rounded-full px-2.5 py-1 text-xs font-semibold">
            {assessment.grade_label}
          </span>
          <span className="bg-koyi-nav-active text-koyi-primary rounded-full px-2.5 py-1 text-xs font-semibold">
            {SUBJECT_LABEL[assessment.subject]}
          </span>
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-semibold',
              DIFFICULTY_CHIP_CLASS[assessment.difficulty],
            )}
          >
            {DIFFICULTY_LABEL[assessment.difficulty]}
          </span>

          <span
            className={cn(
              'ml-auto rounded-full px-2.5 py-1 text-xs font-semibold',
              ASSESSMENT_STATUS_CLASS[assessment.status],
            )}
          >
            {ASSESSMENT_STATUS_LABEL[assessment.status]}
          </span>
        </div>

        <h3 className="text-koyi-text font-display mt-4 text-lg leading-snug font-bold text-balance">
          {assessment.title}
        </h3>

        <p className="text-koyi-muted mt-2 line-clamp-2 text-sm leading-relaxed">
          {assessment.description}
        </p>

        <div className="text-koyi-muted mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5">
            <ClipboardIcon aria-hidden="true" className="size-4" />
            {assessment.question_count} questions
          </span>

          {assessment.time_limit_minutes !== null && (
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon aria-hidden="true" className="size-4" />
              {assessment.time_limit_minutes} min
            </span>
          )}

          {isLive && (
            <span className="inline-flex items-center gap-1.5">
              <UsersIcon aria-hidden="true" className="size-4" />
              {assessment.completed_count} of {assessment.assigned_count} done
            </span>
          )}
        </div>

        <p className="text-koyi-muted mt-3 text-xs">{assessment.updated_label}</p>
      </Link>
    </li>
  );
}

/**
 * The assessment library.
 *
 * Four tabs, a search box and a difficulty select sit on the surface because
 * they are the choices a teacher makes constantly. Everything rarer — status,
 * grade, subject when a tab has not already decided it — lives behind Filter,
 * which shows how many are applied so a narrowed list is never a mystery.
 */
export function AssessmentLibraryPage() {
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<AssessmentFilters>(NO_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const list = useQuery(
    assessmentListQuery({
      tab,
      search,
      difficulty: filters.difficulty,
      subject: filters.subject,
      status: filters.status,
      grade: filters.grade,
      page,
    }),
  );

  const counts = list.data?.tab_counts;
  const applied = activeFilterCount(filters);

  const TABS: SegmentedOption<Tab>[] = [
    { value: 'all', label: counts ? `All assessments (${String(counts.all)})` : 'All assessments' },
    { value: 'literacy', label: counts ? `Literacy (${String(counts.literacy)})` : 'Literacy' },
    { value: 'numeracy', label: counts ? `Numeracy (${String(counts.numeracy)})` : 'Numeracy' },
    { value: 'drafts', label: counts ? `Drafts (${String(counts.drafts)})` : 'Drafts' },
  ];

  const resetPage = () => {
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessments"
        subtitle="Everything you have built, assigned or left as a draft."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setFilterOpen(true);
              }}
            >
              <FilterIcon aria-hidden="true" className="size-4" />
              Filter
              {applied > 0 && (
                <span className="bg-koyi-primary ml-0.5 inline-flex size-5 items-center justify-center rounded-full text-xs font-bold text-white">
                  {applied}
                </span>
              )}
            </Button>

            <Link to={paths.teacher.assessments.create} className={buttonClasses('primary')}>
              <PlusIcon aria-hidden="true" className="size-4" />
              Create assessment
            </Link>
          </div>
        }
      />

      <div className="border-koyi-border flex flex-wrap items-center justify-between gap-4 border-b pb-3">
        <UnderlineTabs
          label="Filter assessments by subject"
          value={tab}
          onChange={(next) => {
            setTab(next);
            resetPage();
          }}
          options={TABS}
        />

        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            label="Search assessments"
            value={search}
            onChange={(next) => {
              setSearch(next);
              resetPage();
            }}
          />

          <SelectField
            label="Difficulty"
            labelHidden
            value={filters.difficulty}
            onChange={(event) => {
              // The surfaced select and the dialog edit the same value, so the
              // two controls can never disagree silently.
              setFilters((current) => ({ ...current, difficulty: event.target.value }));
              resetPage();
            }}
            options={DIFFICULTY_OPTIONS}
            wrapperClassName="w-44"
          />
        </div>
      </div>

      {applied > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <p className="text-koyi-muted">
            {applied} filter{applied === 1 ? '' : 's'} applied
          </p>
          <button
            type="button"
            onClick={() => {
              setFilters(NO_FILTERS);
              resetPage();
            }}
            className="text-koyi-primary font-bold hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {list.isPending && <PageSpinner />}

      {list.isError && (
        <ErrorState
          error={list.error}
          onRetry={() => {
            void list.refetch();
          }}
        />
      )}

      {list.data?.results.length === 0 && (
        <EmptyState
          icon={<ClipboardIcon className="size-6" />}
          title="No assessments match"
          description="Try a different tab, clear your filters, or build a new one."
          action={
            <Link to={paths.teacher.assessments.create} className={buttonClasses('primary')}>
              <PlusIcon aria-hidden="true" className="size-4" />
              Create assessment
            </Link>
          }
        />
      )}

      {list.data && list.data.results.length > 0 && (
        <>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.data.results.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))}
          </ul>

          <Pagination
            page={list.data.page}
            pageCount={list.data.num_pages}
            onPageChange={setPage}
            totalCount={list.data.count}
            pageSize={list.data.page_size}
            itemLabel="assessments"
          />
        </>
      )}

      <AssessmentFilterModal
        open={filterOpen}
        onClose={() => {
          setFilterOpen(false);
        }}
        value={filters}
        onApply={(next) => {
          setFilters(next);
          setFilterOpen(false);
          resetPage();
        }}
      />
    </div>
  );
}
