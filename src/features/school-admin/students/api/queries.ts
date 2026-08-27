import { queryOptions } from '@tanstack/react-query';

import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import {
  studentDetailSchema,
  studentListSchema,
} from '@/features/school-admin/students/api/student.schema';
import { api } from '@/lib/api/client';

export interface StudentListFilters {
  /** Matches student name or student ID, server-side. */
  search: string;
  page: number;
  /** Class id, or `'all'`. Used by the class detail screen and filters. */
  classId: string;
}

export const studentListQuery = (filters: StudentListFilters) =>
  queryOptions({
    queryKey: schoolAdminKeys.studentList(filters),
    queryFn: ({ signal }) =>
      api.get(schoolAdminEndpoints.students.list, studentListSchema, {
        params: {
          search: filters.search || undefined,
          page: filters.page,
          class: filters.classId === 'all' ? undefined : filters.classId,
        },
        signal,
      }),
    placeholderData: (previous) => previous,
  });

export const studentDetailQuery = (studentId: string) =>
  queryOptions({
    queryKey: schoolAdminKeys.studentDetail(studentId),
    queryFn: ({ signal }) =>
      api.get(schoolAdminEndpoints.students.detail(studentId), studentDetailSchema, { signal }),
  });
