import { queryOptions } from '@tanstack/react-query';

import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import { adminAccountSchema } from '@/features/school-admin/settings/api/settings.schema';
import { api } from '@/lib/api/client';

export const adminAccountQuery = () =>
  queryOptions({
    queryKey: schoolAdminKeys.accountSettings(),
    queryFn: ({ signal }) => api.get(schoolAdminEndpoints.account, adminAccountSchema, { signal }),
  });
