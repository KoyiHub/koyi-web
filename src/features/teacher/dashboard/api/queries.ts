import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { teacherEndpoints } from '@/features/teacher/api/endpoints';
import { teacherKeys } from '@/features/teacher/api/queries';
import {
  activityListSchema,
  attentionListSchema,
  classPerformanceSchema,
  dashboardSchema,
  insightsSchema,
} from '@/features/teacher/dashboard/api/dashboard.schema';
import { api } from '@/lib/api/client';

/** The class dashboard: stats, distribution, the top insight and the attention shortlist. */
export const teacherDashboardQuery = () =>
  queryOptions({
    queryKey: teacherKeys.dashboard(),
    queryFn: ({ signal }) => api.get(teacherEndpoints.dashboard, dashboardSchema, { signal }),
    staleTime: 60_000,
  });

interface ActivityFilters {
  /** `all`, or an `ActivityType`. Sent verbatim so the server owns the vocabulary. */
  type: string;
  page: number;
}

/** Recent activity, newest first. The server buckets each item into a day. */
export const activityQuery = (filters: ActivityFilters) =>
  queryOptions({
    queryKey: teacherKeys.activity(filters),
    queryFn: ({ signal }) => {
      const search = new URLSearchParams({ page: String(filters.page) });
      if (filters.type !== 'all') search.set('type', filters.type);

      return api.get(`${teacherEndpoints.activity}?${search.toString()}`, activityListSchema, {
        signal,
      });
    },
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });

interface AttentionFilters {
  /** `all`, or an `AttentionPriority`. */
  priority: string;
  page: number;
}

/** The full students-needing-attention list behind the dashboard's "View all". */
export const attentionQuery = (filters: AttentionFilters) =>
  queryOptions({
    queryKey: teacherKeys.attention(filters),
    queryFn: ({ signal }) => {
      const search = new URLSearchParams({ page: String(filters.page) });
      if (filters.priority !== 'all') search.set('priority', filters.priority);

      return api.get(`${teacherEndpoints.attention}?${search.toString()}`, attentionListSchema, {
        signal,
      });
    },
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });

/**
 * The same feed as `activityQuery`, paged for the "Load older activity" button.
 *
 * The Recent Activity screen appends days as you go rather than replacing the
 * page, so it reads as one continuous timeline. `getNextPageParam` returns
 * `undefined` on the last page, which is what disables the button.
 */
export const activityInfiniteQuery = (type: string) =>
  infiniteQueryOptions({
    queryKey: teacherKeys.activityFeed(type),
    queryFn: ({ pageParam, signal }) => {
      const search = new URLSearchParams({ page: String(pageParam) });
      if (type !== 'all') search.set('type', type);

      return api.get(`${teacherEndpoints.activity}?${search.toString()}`, activityListSchema, {
        signal,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.num_pages ? lastPage.page + 1 : undefined,
    staleTime: 30_000,
  });

/** Every generated insight for the class, not just the one on the dashboard card. */
export const insightsQuery = () =>
  queryOptions({
    queryKey: teacherKeys.insights(),
    queryFn: ({ signal }) => api.get(teacherEndpoints.insights, insightsSchema, { signal }),
    staleTime: 5 * 60_000,
  });

/** Class performance: movement between bands, per-skill averages and the term trend. */
export const classPerformanceQuery = () =>
  queryOptions({
    queryKey: teacherKeys.classPerformance(),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.classPerformance, classPerformanceSchema, { signal }),
    staleTime: 5 * 60_000,
  });
