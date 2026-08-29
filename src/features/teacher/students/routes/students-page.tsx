import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ArrowRightIcon, FlagIcon, UsersIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { paths } from '@/config/paths';
import { LEVEL_CHIP_CLASS } from '@/features/teacher/api/format';
import { DataTable } from '@/features/teacher/components/data-table';
import { studentListQuery } from '@/features/teacher/students/api/queries';
import type { StudentList } from '@/features/teacher/students/api/student.schema';
import { cn } from '@/lib/utils/cn';

type LevelKey = keyof StudentList['level_counts'];

const LEVEL_TABS: { value: LevelKey; label: string }[] = [
  { value: 'all', label: 'Everyone' },
  { value: 'strong', label: 'Strong' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'struggling', label: 'Struggling' },
  { value: 'beginner', label: 'Not yet assessed' },
];

const COLUMNS = [
  { key: 'student', label: 'Student' },
  { key: 'level', label: 'Learning level' },
  { key: 'score', label: 'Latest score', align: 'right' as const },
  { key: 'gap', label: 'Biggest gap' },
  { key: 'assessed', label: 'Last assessed' },
  { key: 'open', label: 'Open profile', align: 'right' as const, labelHidden: true },
];

/**
 * The class roster.
 *
 * A directory is only useful if it answers "who do I teach next", so the level
 * filter carries its own head counts and the children who need attention are
 * marked in the row rather than hidden behind a sort.
 */
export function StudentsPage() {
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<LevelKey>('all');
  const [page, setPage] = useState(1);

  const students = useQuery(studentListQuery({ search, level, page }));

  const counts = students.data?.level_counts;
  const rows = students.data?.results ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        subtitle="Every child in your class, with where they are now."
        actions={
          <SearchInput
            label="Search students"
            placeholder="Search by name or code"
            value={search}
            onChange={(next) => {
              setSearch(next);
              setPage(1);
            }}
            className="w-full sm:w-72"
          />
        }
      />

      <div className="flex flex-wrap gap-2">
        {LEVEL_TABS.map((tab) => {
          const active = tab.value === level;

          return (
            <button
              key={tab.value}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setLevel(tab.value);
                setPage(1);
              }}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                active
                  ? 'bg-koyi-primary text-white'
                  : 'border-koyi-border text-koyi-muted hover:border-koyi-primary hover:text-koyi-primary border bg-white',
              )}
            >
              {tab.label}
              {counts && (
                <span className={cn('ml-2 text-xs', active ? 'text-white/80' : 'text-koyi-muted')}>
                  {counts[tab.value]}
                </span>
              )}
            </button>
          );
        })}
      </div>

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
          description="Clear the search, or choose a different learning level."
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
                      <p className="text-koyi-text flex items-center gap-2 truncate font-bold">
                        {student.full_name}
                        {student.needs_attention && (
                          <span className="text-koyi-band-struggling-ink inline-flex items-center gap-1 text-xs font-semibold">
                            <FlagIcon aria-hidden="true" className="size-3.5" />
                            Needs attention
                          </span>
                        )}
                      </p>
                      <p className="text-koyi-muted text-xs">
                        {student.student_code} · {student.class_name}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-3">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-semibold',
                      LEVEL_CHIP_CLASS[student.level],
                    )}
                  >
                    {student.level_label}
                  </span>
                </td>

                <td className="text-koyi-text px-5 py-3 text-right font-bold">
                  {student.latest_score === null ? '—' : `${String(student.latest_score)}%`}
                </td>

                <td className="text-koyi-muted max-w-56 px-5 py-3">{student.primary_gap ?? '—'}</td>

                <td className="text-koyi-muted px-5 py-3">{student.last_assessed_label}</td>

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
