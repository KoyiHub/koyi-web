import { queryOptions } from '@tanstack/react-query';

import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { gradeListSchema, schoolSchema } from '@/features/school-admin/api/shared.schema';
import { api } from '@/lib/api/client';

/**
 * Query keys for the School Admin application. Every list key carries its
 * filters so a search or page change refetches instead of showing a stale
 * page, and invalidating `schoolAdminKeys.teachers()` after a write clears
 * every teacher list regardless of the filters it was viewed with.
 */
export const schoolAdminKeys = {
  all: ['school-admin'] as const,

  school: () => [...schoolAdminKeys.all, 'school'] as const,
  grades: () => [...schoolAdminKeys.all, 'grades'] as const,
  dashboard: (term: string) => [...schoolAdminKeys.all, 'dashboard', term] as const,

  teachers: () => [...schoolAdminKeys.all, 'teachers'] as const,
  teacherList: (filters: { search: string; page: number }) =>
    [...schoolAdminKeys.teachers(), 'list', filters] as const,
  teacherDetail: (teacherId: string) =>
    [...schoolAdminKeys.teachers(), 'detail', teacherId] as const,

  students: () => [...schoolAdminKeys.all, 'students'] as const,
  studentList: (filters: { search: string; page: number; classId: string }) =>
    [...schoolAdminKeys.students(), 'list', filters] as const,
  studentDetail: (studentId: string) =>
    [...schoolAdminKeys.students(), 'detail', studentId] as const,

  classes: () => [...schoolAdminKeys.all, 'classes'] as const,
  classList: (filters: { gradeId: string }) =>
    [...schoolAdminKeys.classes(), 'list', filters] as const,
  classDetail: (classId: string) => [...schoolAdminKeys.classes(), 'detail', classId] as const,

  settings: () => [...schoolAdminKeys.all, 'settings'] as const,
  academicSettings: () => [...schoolAdminKeys.settings(), 'academic'] as const,
  accountSettings: () => [...schoolAdminKeys.settings(), 'account'] as const,
};

/**
 * The administrator's own school. Used by the app shell for the crest and name
 * lockup under the product logo, so it is cached for the whole session rather
 * than refetched per screen.
 */
export const schoolQuery = () =>
  queryOptions({
    queryKey: schoolAdminKeys.school(),
    queryFn: ({ signal }) => api.get(schoolAdminEndpoints.school, schoolSchema, { signal }),
    staleTime: 10 * 60_000,
  });

/** Grade levels the school runs. Drives the Add Class grade select. */
export const gradesQuery = () =>
  queryOptions({
    queryKey: schoolAdminKeys.grades(),
    queryFn: ({ signal }) => api.get(schoolAdminEndpoints.grades, gradeListSchema, { signal }),
    staleTime: 10 * 60_000,
    select: (data) => data.results,
  });
