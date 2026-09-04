import { queryOptions } from '@tanstack/react-query';

import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import {
  teacherDetailSchema,
  teacherListSchema,
} from '@/features/school-admin/teachers/api/teacher.schema';
import { api } from '@/lib/api/client';

export interface TeacherListFilters {
  /** Matches teacher name or teacher ID, server-side. */
  search: string;
  /** `all`, `active` or `disabled`. */
  status: string;
  page: number;
}

export const teacherListQuery = (filters: TeacherListFilters) =>
  queryOptions({
    queryKey: schoolAdminKeys.teacherList(filters),
    queryFn: ({ signal }) =>
      api.get(schoolAdminEndpoints.teachers.list, teacherListSchema, {
        params: {
          search: filters.search || undefined,
          status: filters.status === 'all' ? undefined : filters.status,
          page: filters.page,
        },
        signal,
      }),
    // Keeps the previous page on screen while the next one loads, so the table
    // does not collapse to a spinner on every keystroke.
    placeholderData: (previous) => previous,
  });

export const teacherDetailQuery = (teacherId: string) =>
  queryOptions({
    queryKey: schoolAdminKeys.teacherDetail(teacherId),
    queryFn: ({ signal }) =>
      api.get(schoolAdminEndpoints.teachers.detail(teacherId), teacherDetailSchema, { signal }),
  });
