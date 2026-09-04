/**
 * School management endpoints, grouped under the `/v1/school/` surface.
 *
 * Paths follow `frontend-integration.md` §4. Several resources there are still
 * marked *Planned*; those are answered by MSW
 * (`src/mocks/school-admin-handlers.ts`) until the backend lands them, and the
 * handler is written to match the guide's JSON exactly so switching over is a
 * base-URL change.
 */
const BASE = '/v1/school';

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
