import { queryOptions } from '@tanstack/react-query';

import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import {
  classDetailSchema,
  classListSchema,
} from '@/features/school-admin/classes/api/class.schema';
import { api } from '@/lib/api/client';

export interface ClassListFilters {
  /** Grade id, or `'all'`. */
  gradeId: string;
}

export const classListQuery = (filters: ClassListFilters) =>
  queryOptions({
    queryKey: schoolAdminKeys.classList(filters),
    queryFn: ({ signal }) =>
      api.get(schoolAdminEndpoints.classes.list, classListSchema, {
        params: { grade: filters.gradeId === 'all' ? undefined : filters.gradeId, page_size: 24 },
        signal,
      }),
    placeholderData: (previous) => previous,
  });

export const classDetailQuery = (classId: string) =>
  queryOptions({
    queryKey: schoolAdminKeys.classDetail(classId),
    queryFn: ({ signal }) =>
      api.get(schoolAdminEndpoints.classes.detail(classId), classDetailSchema, { signal }),
  });
