/**
 * PROVISIONAL School Portal endpoints.
 *
 * No confirmed Django/OpenAPI contract exists for any School Admin resource
 * yet — the backend ships `apps.common` and `apps.users` only. These paths are
 * answered by MSW (`src/mocks/school-admin-handlers.ts`) in development and
 * are NOT verified against the backend.
 *
 * They live in one file on purpose: when the real contract lands this is the
 * only module that changes. The query hooks, the Zod schemas and every screen
 * that uses them stay as they are.
 */
const BASE = '/v1/school-admin';

export const schoolAdminEndpoints = {
  school: `${BASE}/school/`,
  dashboard: `${BASE}/dashboard/`,
  grades: `${BASE}/grades/`,

  teachers: {
    list: `${BASE}/teachers/`,
    detail: (teacherId: string) => `${BASE}/teachers/${teacherId}/`,
    resetPassword: (teacherId: string) => `${BASE}/teachers/${teacherId}/reset-password/`,
  },

  students: {
    list: `${BASE}/students/`,
    detail: (studentId: string) => `${BASE}/students/${studentId}/`,
  },

  classes: {
    list: `${BASE}/classes/`,
    detail: (classId: string) => `${BASE}/classes/${classId}/`,
  },

  settings: {
    academic: `${BASE}/settings/academic/`,
    account: `${BASE}/settings/account/`,
    accountPassword: `${BASE}/settings/account/password/`,
  },
} as const;
