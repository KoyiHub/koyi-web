/**
 * PROVISIONAL Teacher Portal endpoints.
 *
 * No confirmed Django/OpenAPI contract exists for any of these yet. They are
 * answered by MSW (`src/mocks/teacher-handlers.ts`) in development and are NOT
 * verified against the backend.
 *
 * They live in one file on purpose: when the real contract lands this is the
 * only module that changes. The query hooks, the Zod schemas and every screen
 * that uses them stay as they are.
 */
const BASE = '/v1/teacher';

export const teacherEndpoints = {
  profile: `${BASE}/profile/`,

  /** Dashboard and the four drill-downs opened from its cards. */
  dashboard: `${BASE}/dashboard/`,
  activity: `${BASE}/activity/`,
  attention: `${BASE}/attention/`,
  insights: `${BASE}/insights/`,
  classPerformance: `${BASE}/class-performance/`,

  assessments: {
    list: `${BASE}/assessments/`,
    create: `${BASE}/assessments/`,
    detail: (assessmentId: string) => `${BASE}/assessments/${assessmentId}/`,
    results: (assessmentId: string) => `${BASE}/assessments/${assessmentId}/results/`,
    analytics: (assessmentId: string) => `${BASE}/assessments/${assessmentId}/analytics/`,
    assign: (assessmentId: string) => `${BASE}/assessments/${assessmentId}/assign/`,
  },

  /** Lookup tables the assessment builder needs to populate its selects. */
  questionLayouts: `${BASE}/question-layouts/`,

  questionBank: {
    list: `${BASE}/question-bank/`,
    summary: `${BASE}/question-bank/summary/`,
  },

  students: {
    list: `${BASE}/students/`,
    detail: (studentId: string) => `${BASE}/students/${studentId}/`,
    profile: (studentId: string) => `${BASE}/students/${studentId}/learning-profile/`,
  },
} as const;
