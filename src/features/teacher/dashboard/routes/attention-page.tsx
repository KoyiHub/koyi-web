import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { AlertCircleIcon, ArrowLeftIcon, DownloadIcon, FlagIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { Pagination } from '@/components/ui/pagination';
import { SegmentedControl, type SegmentedOption } from '@/components/ui/segmented-control';
import { paths } from '@/config/paths';
import {
  formatDate,
  PRIORITY_CHIP_CLASS,
  PRIORITY_LABEL,
  SUBJECT_LABEL,
} from '@/features/teacher/api/format';
import { DataTable } from '@/features/teacher/components/data-table';
import type { AttentionRow } from '@/features/teacher/dashboard/api/dashboard.schema';
import { attentionQuery } from '@/features/teacher/dashboard/api/queries';
import { cn } from '@/lib/utils/cn';

const PRIORITY_OPTIONS: SegmentedOption<string>[] = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const COLUMNS = [
  { key: 'student', label: 'Student' },
  { key: 'priority', label: 'Priority' },
  { key: 'issue', label: 'Identified issue' },
  { key: 'assessed', label: 'Last assessment' },
  { key: 'action', label: 'Recommended action' },
  { key: 'open', label: 'Open profile', align: 'right' as const, labelHidden: true },
];

const EXPORT_HEADERS = [
  'Student',
  'Student code',
  'Priority',
  'Identified issue',
  'Subject',
  'Last assessment',
  'Recommended action',
];

/** Wraps a value so a comma or quote inside it cannot break the column. */
function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

/**
 * Exports what the teacher is currently looking at.
 *
 * Deliberately client-side and deliberately limited to the rows already on
 * screen: this is a printable copy of the visible list, not a data extract, so
 * it can never hand out more than the page already showed.
 */
function exportRows(rows: AttentionRow[]) {
  const lines = [
    EXPORT_HEADERS.map(csvCell).join(','),
    ...rows.map((row) =>
      [
        row.full_name,
        row.student_code,
        PRIORITY_LABEL[row.priority],
        row.identified_issue,
        SUBJECT_LABEL[row.subject],
        row.last_assessment_label,
        row.recommended_action,
      ]
        .map(csvCell)
        .join(','),
    ),
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'students-needing-attention.csv';
  link.click();

  URL.revokeObjectURL(url);
}

interface PriorityCardProps {
  label: string;
  count: number;
  caption: string;
  active: boolean;
  toneClassName: string;
  onSelect: () => void;
}

/** A count that is also the filter for that count — the card is the control. */
function PriorityCard({
  label,
  count,
  caption,
  active,
  toneClassName,
  onSelect,
}: PriorityCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        'rounded-koyi-xl bg-koyi-card border p-5 text-left transition-colors',
        active ? 'border-koyi-primary ring-koyi-primary/20 ring-2' : 'border-koyi-border',
        'hover:border-koyi-primary',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-koyi-muted text-sm font-medium">{label}</p>
          <p className="text-koyi-text font-display text-koyi-stat mt-2 leading-none font-extrabold">
            {count}
          </p>
        </div>
        <span
          aria-hidden="true"
          className={cn('flex size-11 items-center justify-center rounded-full', toneClassName)}
        >
          <FlagIcon className="size-5" />
        </span>
      </div>
      <p className="text-koyi-muted mt-4 text-xs font-semibold">{caption}</p>
    </button>
  );
}

/**
 * The full list behind the dashboard's "Students needing attention" card.
 *
 * Priority is decided by the server. The three count cards double as the
 * filter, so a teacher who reads "6 high priority" can act on that number in
 * the same click instead of hunting for a matching control.
 */
export function AttentionPage() {
  const [priority, setPriority] = useState('all');
  const [page, setPage] = useState(1);
  const attention = useQuery(attentionQuery({ priority, page }));

  const changePriority = (next: string) => {
    setPriority(next);
    setPage(1);
  };

  const rows = attention.data?.results ?? [];
  const counts = attention.data?.priority_counts;

  return (
    <div className="space-y-6">
      <Link
        to={paths.teacher.dashboard}
        className="text-koyi-muted hover:text-koyi-text inline-flex items-center gap-1.5 text-sm font-semibold"
      >
        <ArrowLeftIcon aria-hidden="true" className="size-4" />
        Back to dashboard
      </Link>

      <PageHeader
        title="Students needing attention"
        subtitle="Children the latest results flagged, with what to do next."
        actions={
          <Button
            variant="secondary"
            disabled={rows.length === 0}
            onClick={() => {
              exportRows(rows);
            }}
          >
            <DownloadIcon aria-hidden="true" className="size-4" />
            Export this list
          </Button>
        }
      />

      {counts && (
        <div className="grid gap-4 sm:grid-cols-3">
          <PriorityCard
            label="High priority"
            count={counts.high}
            caption="Act this week"
            active={priority === 'high'}
            toneClassName="bg-koyi-band-struggling-soft text-koyi-band-struggling-ink"
            onSelect={() => {
              changePriority(priority === 'high' ? 'all' : 'high');
            }}
          />
          <PriorityCard
            label="Medium priority"
            count={counts.medium}
            caption="Watch over the next fortnight"
            active={priority === 'medium'}
            toneClassName="bg-amber-100 text-amber-800"
            onSelect={() => {
              changePriority(priority === 'medium' ? 'all' : 'medium');
            }}
          />
          <PriorityCard
            label="Low priority"
            count={counts.low}
            caption="Keep an eye on progress"
            active={priority === 'low'}
            toneClassName="bg-koyi-band-intermediate-soft text-koyi-band-intermediate-ink"
            onSelect={() => {
              changePriority(priority === 'low' ? 'all' : 'low');
            }}
          />
        </div>
      )}

      {attention.isPending && <PageSpinner />}

      {attention.isError && (
        <ErrorState
          error={attention.error}
          onRetry={() => {
            void attention.refetch();
          }}
        />
      )}

      {attention.data && (
        <Card
          title="Priority alerts"
          subtitle={`${String(attention.data.count)} children match this filter`}
          action={
            <SegmentedControl
              label="Filter by priority"
              value={priority}
              onChange={changePriority}
              options={PRIORITY_OPTIONS}
            />
          }
        >
          {rows.length === 0 ? (
            <EmptyState
              icon={<AlertCircleIcon className="size-6" />}
              title="No children at this priority"
              description="Nothing in your class is flagged at this level right now."
            />
          ) : (
            <>
              <DataTable
                caption="Children flagged for attention, their identified issue and the recommended action"
                columns={COLUMNS}
                minWidthClassName="min-w-240"
              >
                {rows.map((row) => (
                  <tr key={row.student_id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <InitialsAvatar name={row.full_name} />
                        <div className="min-w-0">
                          <p className="text-koyi-text truncate font-bold">{row.full_name}</p>
                          <p className="text-koyi-muted text-xs">{row.student_code}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
                          PRIORITY_CHIP_CLASS[row.priority],
                        )}
                      >
                        {PRIORITY_LABEL[row.priority]}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-koyi-text">{row.identified_issue}</p>
                      <p className="text-koyi-muted text-xs">{SUBJECT_LABEL[row.subject]}</p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-koyi-text">{row.last_assessment_label}</p>
                      <p className="text-koyi-muted text-xs">{formatDate(row.last_assessment)}</p>
                    </td>

                    <td className="text-koyi-text max-w-72 px-5 py-4">{row.recommended_action}</td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        to={paths.teacher.students.detail(row.student_id)}
                        className="border-koyi-primary text-koyi-primary hover:bg-koyi-nav-active inline-flex h-9 items-center rounded-md border px-3 text-xs font-bold transition-colors"
                      >
                        View profile
                        <span className="sr-only"> for {row.full_name}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </DataTable>

              <Pagination
                page={attention.data.page}
                pageCount={attention.data.num_pages}
                onPageChange={setPage}
                totalCount={attention.data.count}
                pageSize={attention.data.page_size}
                itemLabel="children"
                className="mt-5"
              />
            </>
          )}
        </Card>
      )}
    </div>
  );
}
