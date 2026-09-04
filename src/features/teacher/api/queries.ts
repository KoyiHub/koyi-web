/**
 * Query keys for the Teacher application. Every list key carries its filters,
 * so changing a search term or a page refetches rather than showing a stale
 * page, and invalidating `teacherKeys.assessments()` after a write clears
 * every assessment list regardless of the filters it was viewed with.
 */
export const teacherKeys = {
  all: ['teacher'] as const,

  dashboard: () => [...teacherKeys.all, 'dashboard'] as const,
  activity: (filters: { type: string; page: number }) =>
    [...teacherKeys.all, 'activity', filters] as const,
  /** The append-as-you-go feed behind "Load older activity". */
  activityFeed: (type: string) => [...teacherKeys.all, 'activity-feed', type] as const,
  insights: () => [...teacherKeys.all, 'insights'] as const,
  classPerformance: () => [...teacherKeys.all, 'class-performance'] as const,

  // Assessment authoring and bank keys now live beside their own query
  // modules — `@/features/teacher/assessments/api/queries` (`assessmentKeys`)
  // and `@/features/teacher/bank/api/queries` (`bankKeys`) — since those are
  // real, live query hooks now rather than the placeholders these once were.

  students: () => [...teacherKeys.all, 'students'] as const,
  studentList: (filters: { page: number }) => [...teacherKeys.students(), 'list', filters] as const,
  studentProfile: (studentId: string) =>
    [...teacherKeys.students(), 'learning-profile', studentId] as const,
};

/**
 * No `/v1/teacher/profile/` endpoint exists (§5.1 has no anchor for it) — the
 * app shell reads identity/class from `teacherDashboardQuery` instead
 * (`@/features/teacher/dashboard/api/queries`), which carries `teacher_name`
 * and `school_class` and is already fetched on every teacher screen.
 */
