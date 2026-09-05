import { queryOptions } from '@tanstack/react-query';

import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import { classListSchema } from '@/features/school-admin/classes/api/class.schema';
import { api } from '@/lib/api/client';

/** §4.3 — unpaginated. The whole school's class list, filterable by grade. */
export const classListQuery = (gradeId: string) =>
  queryOptions({
    queryKey: schoolAdminKeys.classList(gradeId),
    queryFn: ({ signal }) =>
      api.get(schoolAdminEndpoints.classes.list, classListSchema, {
        params: { grade: gradeId === 'all' ? undefined : gradeId },
        signal,
      }),
    staleTime: 60_000,
  });
