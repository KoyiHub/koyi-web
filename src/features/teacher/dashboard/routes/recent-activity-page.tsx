import { useInfiniteQuery } from '@tanstack/react-query';
import { type ComponentType, type SVGProps, useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClipboardIcon,
  DownloadIcon,
  FlagIcon,
  HistoryIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { SelectField } from '@/components/ui/select-field';
import { paths } from '@/config/paths';
import { formatTime } from '@/features/teacher/api/format';
import type { ActivityItem, ActivityType } from '@/features/teacher/dashboard/api/dashboard.schema';
import { activityInfiniteQuery } from '@/features/teacher/dashboard/api/queries';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All activity types' },
  { value: 'assessment_completed', label: 'Assessments completed' },
  { value: 'assessment_assigned', label: 'Assessments assigned' },
  { value: 'student_flagged', label: 'Students flagged' },
  { value: 'group_updated', label: 'Groups updated' },
  { value: 'report_exported', label: 'Reports exported' },
  { value: 'insight_generated', label: 'Insights generated' },
];

interface TypeStyle {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  chipClassName: string;
}

/** Each kind of event gets its own marker, so a day of mixed events is scannable. */
const TYPE_STYLE: Record<ActivityType, TypeStyle> = {
  assessment_completed: {
    Icon: CheckCircleIcon,
    chipClassName: 'bg-koyi-band-strong-soft text-koyi-band-strong-ink',
  },
  assessment_assigned: {
    Icon: ClipboardIcon,
    chipClassName: 'bg-koyi-nav-active text-koyi-primary',
  },
  student_flagged: {
    Icon: FlagIcon,
    chipClassName: 'bg-koyi-band-struggling-soft text-koyi-band-struggling-ink',
  },
  group_updated: { Icon: UserGroupIcon, chipClassName: 'bg-koyi-nav-active text-koyi-primary' },
  report_exported: { Icon: DownloadIcon, chipClassName: 'bg-koyi-surface text-koyi-muted' },
  insight_generated: { Icon: SparklesIcon, chipClassName: 'bg-amber-100 text-amber-800' },
};

/** Groups a flat, already-ordered feed by the day bucket the server assigned. */
function groupByDay(items: ActivityItem[]): { day: string; items: ActivityItem[] }[] {
  const days: { day: string; items: ActivityItem[] }[] = [];

  for (const item of items) {
    const current = days[days.length - 1];
    if (current?.day === item.day_label) {
      current.items.push(item);
    } else {
      days.push({ day: item.day_label, items: [item] });
    }
  }

  return days;
}

/** Where an event can take you, when it points at something. */
function destinationFor(item: ActivityItem): string | null {
  if (item.student_id) return paths.teacher.students.detail(item.student_id);
  if (item.assessment_id) return paths.teacher.assessments.detail(item.assessment_id);
  if (item.type === 'insight_generated') return paths.teacher.insights.aiInsights;
  return null;
}

/**
 * The full class timeline behind the dashboard's Recent activity card.
 *
 * Days come pre-bucketed from the API (`day_label`), so paging can never split
 * a day two different ways — the client groups on that label and nothing else.
 */
export function RecentActivityPage() {
  const [type, setType] = useState('all');
  const feed = useInfiniteQuery(activityInfiniteQuery(type));

  const items = feed.data?.pages.flatMap((page) => page.results) ?? [];
  const days = groupByDay(items);
  const total = feed.data?.pages[0]?.count ?? 0;

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
        title="Recent activity"
        subtitle="Everything that has happened in your class, newest first."
        actions={
          <SelectField
            label="Filter by activity type"
            labelHidden
            value={type}
            onChange={(event) => {
              setType(event.target.value);
            }}
            options={TYPE_OPTIONS}
            wrapperClassName="w-full sm:w-64"
          />
        }
      />

      {feed.isPending && <PageSpinner />}

      {feed.isError && (
        <ErrorState
          error={feed.error}
          onRetry={() => {
            void feed.refetch();
          }}
        />
      )}

      {feed.data && items.length === 0 && (
        <EmptyState
          icon={<HistoryIcon className="size-6" />}
          title="Nothing to show yet"
          description="No activity of this type has been recorded for your class. Try a different filter."
        />
      )}

      {days.length > 0 && (
        <Card title="Class timeline" subtitle={`${String(total)} events recorded`}>
          <div className="space-y-8">
            {days.map((day) => (
              <section key={day.day} aria-label={day.day}>
                <h3 className="text-koyi-muted text-xs font-bold tracking-wide uppercase">
                  {day.day}
                </h3>

                <ol className="mt-4 space-y-4">
                  {day.items.map((item) => {
                    const { Icon, chipClassName } = TYPE_STYLE[item.type];
                    const to = destinationFor(item);

                    return (
                      <li key={item.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span
                            aria-hidden="true"
                            className={`flex size-9 shrink-0 items-center justify-center rounded-full ${chipClassName}`}
                          >
                            <Icon className="size-4" />
                          </span>
                          <span aria-hidden="true" className="bg-koyi-border mt-2 w-px flex-1" />
                        </div>

                        <div className="border-koyi-border min-w-0 flex-1 border-b pb-4 last:border-b-0">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <p className="text-koyi-text font-bold">{item.title}</p>
                            <p className="text-koyi-muted shrink-0 text-xs">
                              {formatTime(item.occurred_at)}
                            </p>
                          </div>

                          <p className="text-koyi-muted mt-1 text-sm">{item.description}</p>

                          {to && (
                            <Link
                              to={to}
                              className="text-koyi-primary mt-2 inline-block text-xs font-bold hover:underline"
                            >
                              Open
                              <span className="sr-only"> {item.title}</span>
                            </Link>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}
          </div>

          {feed.hasNextPage && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="secondary"
                isLoading={feed.isFetchingNextPage}
                onClick={() => {
                  void feed.fetchNextPage();
                }}
              >
                Load older activity
              </Button>
            </div>
          )}

          {!feed.hasNextPage && items.length > 0 && (
            <p className="text-koyi-muted mt-6 text-center text-xs">
              That is the whole timeline for this class.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
