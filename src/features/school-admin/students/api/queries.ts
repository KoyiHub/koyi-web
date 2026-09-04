import { queryOptions } from '@tanstack/react-query';

import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import { studentFlnSchema } from '@/features/school-admin/students/api/fln.schema';
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
  /** `all`, `active` or `disabled`. */
  status: string;
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
          status: filters.status === 'all' ? undefined : filters.status,
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

/** §4.5 — the school-level FLN view: two independent levels, not the teacher's full breakdown. */
export const studentFlnQuery = (studentId: string) =>
  queryOptions({
    queryKey: schoolAdminKeys.studentFln(studentId),
    queryFn: ({ signal }) =>
      api.get(schoolAdminEndpoints.students.fln(studentId), studentFlnSchema, { signal }),
  });
