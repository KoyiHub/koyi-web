import { queryOptions } from '@tanstack/react-query';

import { teacherEndpoints } from '@/features/teacher/api/endpoints';
import { teacherProfileSchema } from '@/features/teacher/api/shared.schema';
import { api } from '@/lib/api/client';

/**
 * Query keys for the Teacher application. Every list key carries its filters,
 * so changing a search term or a page refetches rather than showing a stale
 * page, and invalidating `teacherKeys.assessments()` after a write clears
 * every assessment list regardless of the filters it was viewed with.
 */
export const teacherKeys = {
  all: ['teacher'] as const,

  profile: () => [...teacherKeys.all, 'profile'] as const,

  dashboard: () => [...teacherKeys.all, 'dashboard'] as const,
  activity: (filters: { type: string; page: number }) =>
    [...teacherKeys.all, 'activity', filters] as const,
  attention: (filters: { priority: string; page: number }) =>
    [...teacherKeys.all, 'attention', filters] as const,
  /** The append-as-you-go feed behind "Load older activity". */
  activityFeed: (type: string) => [...teacherKeys.all, 'activity-feed', type] as const,
  insights: () => [...teacherKeys.all, 'insights'] as const,
  classPerformance: () => [...teacherKeys.all, 'class-performance'] as const,

  // Assessment authoring and bank keys now live beside their own query
  // modules — `@/features/teacher/assessments/api/queries` (`assessmentKeys`)
  // and `@/features/teacher/bank/api/queries` (`bankKeys`) — since those are
  // real, live query hooks now rather than the placeholders these once were.

  students: () => [...teacherKeys.all, 'students'] as const,
  studentList: (filters: { search: string; level: string; page: number }) =>
    [...teacherKeys.students(), 'list', filters] as const,
  studentProfile: (studentId: string) =>
    [...teacherKeys.students(), 'learning-profile', studentId] as const,
};

/**
 * The signed-in teacher. The app shell reads the name, class and school from
 * here, so it is cached for the session rather than refetched per screen.
 */
export const teacherProfileQuery = () =>
  queryOptions({
    queryKey: teacherKeys.profile(),
    queryFn: ({ signal }) => api.get(teacherEndpoints.profile, teacherProfileSchema, { signal }),
    staleTime: 10 * 60_000,
  });
