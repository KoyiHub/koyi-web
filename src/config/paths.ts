/**
 * The single source of truth for URLs. Components and tests build links from
 * here, so changing a path is one edit instead of a grep-and-pray.
 */
export const paths = {
  dashboard: '/',
  auth: {
    login: '/login',
    signup: '/signup',
  },
  assessment: {
    setup: '/assessment',
    session: '/assessment/session',
    complete: '/assessment/session/complete',
    results: '/assessment/results',
  },
  students: {
    list: '/students',
    detail: (studentId: string) => `/students/${studentId}`,
    groups: '/students/groups',
    groupDetail: (groupId: string) => `/students/groups/${groupId}`,
  },
  progress: '/progress',
  profile: '/profile',
  users: {
    list: '/users',
    detail: (userId: string | number) => `/users/${String(userId)}`,
  },
} as const;
