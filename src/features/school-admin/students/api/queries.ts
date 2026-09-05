import { queryOptions } from '@tanstack/react-query';

import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import { studentFlnSchema } from '@/features/school-admin/students/api/fln.schema';
import {
  studentListSchema,
  studentSchema,
} from '@/features/school-admin/students/api/student.schema';
import { api } from '@/lib/api/client';

export interface StudentListFilters {
  /** Matches student name or student ID, server-side. */
  search: string;
  page: number;
  /** Class id, or `'all'`. Used by the class detail screen and filters. */
  schoolClass: string;
}

/**
 * §4.5's documented filters are `?search=&school_class=` only — there is no
 * `?is_active=` param, even though §7.3 asks for an active/disabled filter
 * on this list. Active/disabled is filtered client-side over the fetched
 * page rather than inventing an undocumented query param.
 */
export const studentListQuery = (filters: StudentListFilters) =>
  queryOptions({
    queryKey: schoolAdminKeys.studentList(filters),
    queryFn: ({ signal }) =>
      api.get(schoolAdminEndpoints.students.list, studentListSchema, {
        params: {
          search: filters.search || undefined,
          page: filters.page,
          school_class: filters.schoolClass === 'all' ? undefined : filters.schoolClass,
        },
        signal,
      }),
    placeholderData: (previous) => previous,
  });

export const studentDetailQuery = (studentId: string) =>
  queryOptions({
    queryKey: schoolAdminKeys.studentDetail(studentId),
    queryFn: ({ signal }) =>
      api.get(schoolAdminEndpoints.students.detail(studentId), studentSchema, { signal }),
  });

/** §4.5 — the school-level FLN view: two independent levels, not the teacher's full breakdown. */
export const studentFlnQuery = (studentId: string) =>
  queryOptions({
    queryKey: schoolAdminKeys.studentFln(studentId),
    queryFn: ({ signal }) =>
      api.get(schoolAdminEndpoints.students.fln(studentId), studentFlnSchema, { signal }),
  });
