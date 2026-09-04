import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ArrowLeftIcon, HistoryIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { SelectField } from '@/components/ui/select-field';
import { paths } from '@/config/paths';
import type { ActivityRow } from '@/features/school-admin/activity/api/activity.schema';
import { activityFeedQuery } from '@/features/school-admin/activity/api/queries';
import { classListQuery } from '@/features/school-admin/classes/api/queries';
import { studentListQuery } from '@/features/school-admin/students/api/queries';
import { teacherListQuery } from '@/features/school-admin/teachers/api/queries';

const timeFormatter = new Intl.DateTimeFormat('en-NG', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

function formatOccurredAt(iso: string): string {
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? iso : timeFormatter.format(parsed);
}

/** Renders `label` verbatim — the server's wording survives a renamed or deleted row. */
function ActivityEntry({ row }: { row: ActivityRow }) {
  return (
    <li className="border-koyi-border border-b py-3 last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-koyi-text font-bold">{row.label}</p>
        <p className="text-koyi-muted shrink-0 text-xs">{formatOccurredAt(row.occurred_at)}</p>
      </div>
      <p className="text-koyi-muted mt-1 text-sm">{row.description}</p>
    </li>
  );
}

/**
 * The school-wide activity feed — `frontend-integration.md` §4.6.
 *
 * Cursor-paginated, so this is a "load more" list, not numbered pages —
 * `next` is followed verbatim rather than reconstructed from a page number.
 * The `action` filter's options are built from actions actually seen in the
 * feed rather than a guessed-at enum, since the guide gives examples but not
 * the full `ActivityAction` list, and an unrecognised value is a `400`.
 */
export function ActivityPage() {
  const [action, setAction] = useState('');
  const [teacher, setTeacher] = useState('');
  const [student, setStudent] = useState('');
  const [schoolClass, setSchoolClass] = useState('');

  const teachers = useQuery(teacherListQuery({ search: '', status: 'all', page: 1 }));
  const students = useQuery(
    studentListQuery({ search: '', page: 1, classId: 'all', status: 'all' }),
  );
  const classes = useQuery(classListQuery({ gradeId: 'all' }));

  const feed = useInfiniteQuery(activityFeedQuery({ action, teacher, student, schoolClass }));
  const rows = useMemo(() => feed.data?.pages.flatMap((page) => page.results) ?? [], [feed.data]);
  const actionOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const row of rows) seen.set(row.action, row.label);
    return Array.from(seen.keys()).map((value) => ({ value, label: value.replaceAll('_', ' ') }));
  }, [rows]);

  return (
    <div className="space-y-6">
      <Link
        to={paths.schoolAdmin.dashboard}
        className="text-koyi-primary inline-flex items-center gap-2 text-sm font-semibold"
      >
        <ArrowLeftIcon aria-hidden="true" className="size-4" />
        Back to Dashboard
      </Link>

      <PageHeader title="Activity" subtitle="Everything that has happened across the school." />

      <Card bodyClassName="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField
          label="Action"
          placeholder="All actions"
          options={actionOptions}
          value={action}
          onChange={(event) => {
            setAction(event.target.value);
          }}
        />
        <SelectField
          label="Teacher"
          placeholder="All teachers"
          options={(teachers.data?.results ?? []).map((entry) => ({
            value: entry.id,
            label: entry.full_name,
          }))}
          value={teacher}
          onChange={(event) => {
            setTeacher(event.target.value);
          }}
        />
        <SelectField
          label="Student"
          placeholder="All students"
          options={(students.data?.results ?? []).map((entry) => ({
            value: entry.id,
            label: entry.full_name,
          }))}
          value={student}
          onChange={(event) => {
            setStudent(event.target.value);
          }}
        />
        <SelectField
          label="Class"
          placeholder="All classes"
          options={(classes.data?.results ?? []).map((entry) => ({
            value: entry.id,
            label: entry.display_name,
          }))}
          value={schoolClass}
          onChange={(event) => {
            setSchoolClass(event.target.value);
          }}
        />
      </Card>

      {feed.isPending && <PageSpinner />}

      {feed.isError && (
        <ErrorState
          error={feed.error}
          onRetry={() => {
            void feed.refetch();
          }}
        />
      )}

      {feed.data && rows.length === 0 && (
        <EmptyState
          icon={<HistoryIcon className="size-6" />}
          title="Nothing to show yet"
          description="No activity matches these filters."
        />
      )}

      {rows.length > 0 && (
        <Card>
          <ul>
            {rows.map((row) => (
              <ActivityEntry key={row.id} row={row} />
            ))}
          </ul>

          {feed.hasNextPage && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="secondary"
                isLoading={feed.isFetchingNextPage}
                onClick={() => {
                  void feed.fetchNextPage();
                }}
              >
                Load more
              </Button>
            </div>
          )}

          {!feed.hasNextPage && (
            <p className="text-koyi-muted mt-6 text-center text-xs">
              That is the whole feed for these filters.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
