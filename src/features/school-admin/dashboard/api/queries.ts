import { queryOptions } from '@tanstack/react-query';

import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import {
  dashboardSummarySchema,
  type TermFilter,
} from '@/features/school-admin/dashboard/api/dashboard.schema';
import { api } from '@/lib/api/client';

/** School-wide FLN analytics for one term. */
export const dashboardSummaryQuery = (term: TermFilter) =>
  queryOptions({
    queryKey: schoolAdminKeys.dashboard(term),
    queryFn: ({ signal }) =>
      api.get(schoolAdminEndpoints.dashboard, dashboardSummarySchema, {
        params: { term },
        signal,
      }),
    // Switching terms should feel instant once a term has been viewed.
    staleTime: 5 * 60_000,
  });
