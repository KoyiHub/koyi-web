import { queryOptions } from '@tanstack/react-query';

import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import { overviewSchema } from '@/features/school-admin/dashboard/api/dashboard.schema';
import { api } from '@/lib/api/client';

/** §4.7 — counts, a status breakdown, and level distribution. */
export const overviewQuery = () =>
  queryOptions({
    queryKey: schoolAdminKeys.overview(),
    queryFn: ({ signal }) => api.get(schoolAdminEndpoints.overview, overviewSchema, { signal }),
    staleTime: 5 * 60_000,
  });
