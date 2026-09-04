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
  /** §4.2 — name, logo, current session. Abbreviation is read-only after registration. */
  profile: `${BASE}/profile/`,
  profilePassword: `${BASE}/profile/password/change/`,
  /** §4.7 — counts, a status breakdown, and (once placement lands) level distribution. */
  overview: `${BASE}/overview/`,
  grades: `${BASE}/grades/`,
  /** Unpaginated reference data — feeds the current-session picker in settings. */
  sessions: `${BASE}/sessions/`,
  /** §4.6 — every core action, with server-authored label/description. */
  activity: `${BASE}/activity/`,
  /** §4.8 — every assessment across every teacher, for oversight, not authoring. */
  assessments: `${BASE}/assessments/`,

  teachers: {
    list: `${BASE}/teachers/`,
    detail: (teacherId: string) => `${BASE}/teachers/${teacherId}/`,
    disable: (teacherId: string) => `${BASE}/teachers/${teacherId}/disable/`,
    enable: (teacherId: string) => `${BASE}/teachers/${teacherId}/enable/`,
    /** Note the word order — the guide's path, not `reset-password`. */
    passwordReset: (teacherId: string) => `${BASE}/teachers/${teacherId}/password-reset/`,
    deleteRequest: (teacherId: string) => `${BASE}/teachers/${teacherId}/delete/request/`,
    deleteConfirm: (teacherId: string) => `${BASE}/teachers/${teacherId}/delete/confirm/`,
  },

  students: {
    list: `${BASE}/students/`,
    detail: (studentId: string) => `${BASE}/students/${studentId}/`,
    fln: (studentId: string) => `${BASE}/students/${studentId}/fln/`,
    disable: (studentId: string) => `${BASE}/students/${studentId}/disable/`,
    enable: (studentId: string) => `${BASE}/students/${studentId}/enable/`,
    deleteRequest: (studentId: string) => `${BASE}/students/${studentId}/delete/request/`,
    deleteConfirm: (studentId: string) => `${BASE}/students/${studentId}/delete/confirm/`,
    transfer: `${BASE}/students/transfer/`,
    transferClass: `${BASE}/students/transfer-class/`,
  },

  /**
   * §4.3 — unpaginated. There is no `GET .../{id}/` detail endpoint; a class
   * is looked up client-side from the already-fetched list. `detail` below
   * exists only to build the `DELETE` URL, which the guide does document.
   */
  classes: {
    list: `${BASE}/classes/`,
    detail: (classId: string) => `${BASE}/classes/${classId}/`,
  },
} as const;
