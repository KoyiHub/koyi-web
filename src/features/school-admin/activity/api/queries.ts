import { infiniteQueryOptions } from '@tanstack/react-query';

import { activityFeedSchema } from '@/features/school-admin/activity/api/activity.schema';
import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import { api } from '@/lib/api/client';

export interface ActivityFilters {
  /** `''` for no filter. Sent verbatim — the server owns `ActivityAction`'s vocabulary. */
  action: string;
  teacher: string;
  student: string;
  schoolClass: string;
}

/**
 * The activity feed — `frontend-integration.md` §4.6. **Cursor-paginated**,
 * not page-numbered: rows can land while someone is reading, so an offset
 * could skip or repeat one. `next` is a full URL and is followed verbatim
 * rather than reconstructed from a page number.
 */
export const activityFeedQuery = (filters: ActivityFilters) =>
  infiniteQueryOptions({
    queryKey: schoolAdminKeys.activity(filters),
    queryFn: ({ pageParam, signal }) =>
      pageParam
        ? api.get(pageParam, activityFeedSchema, { signal })
        : api.get(schoolAdminEndpoints.activity, activityFeedSchema, {
            params: {
              action: filters.action || undefined,
              teacher: filters.teacher || undefined,
              student: filters.student || undefined,
              school_class: filters.schoolClass || undefined,
            },
            signal,
          }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next,
    staleTime: 30_000,
  });
