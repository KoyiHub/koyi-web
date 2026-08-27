import { queryOptions } from '@tanstack/react-query';

import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import {
  academicSettingsSchema,
  adminAccountSchema,
} from '@/features/school-admin/settings/api/settings.schema';
import { api } from '@/lib/api/client';

export const academicSettingsQuery = () =>
  queryOptions({
    queryKey: schoolAdminKeys.academicSettings(),
    queryFn: ({ signal }) =>
      api.get(schoolAdminEndpoints.settings.academic, academicSettingsSchema, { signal }),
  });

export const adminAccountQuery = () =>
  queryOptions({
    queryKey: schoolAdminKeys.accountSettings(),
    queryFn: ({ signal }) =>
      api.get(schoolAdminEndpoints.settings.account, adminAccountSchema, { signal }),
  });
