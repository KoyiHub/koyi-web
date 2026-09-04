/**
 * Teacher surface endpoints, grouped under `/v1/teacher/`.
 *
 * Paths follow `frontend-integration.md` §5. Where the guide marks something
 * *Planned*, MSW answers it (`src/mocks/teacher-handlers.ts`) with a body
 * written to match the guide's JSON literally — so switching to the real
 * server is a base-URL change and no screen is rewritten.
 */
const BASE = '/v1/teacher';

export const teacherEndpoints = {
  // Distinct from `teacherAuthEndpoints.me` (@/features/auth/api/endpoints):
  // that is the lightweight auth check, this is the full profile the
  // dashboard shell renders (school name, class, student count).
  profile: `${BASE}/profile/`,

  /** Dashboard and the drill-downs opened from its cards. */
  dashboard: `${BASE}/dashboard/`,
  activity: `${BASE}/activity/`,
  attention: `${BASE}/attention/`,
  insights: `${BASE}/insights/`,
  classPerformance: `${BASE}/class-performance/`,

  /**
   * The taxonomy and the question bank — 14 skills, 55 subskills, each bounded
   * by a level range. **Read-only to teachers.** They select from it or write
   * their own; neither path writes back here.
   */
  bank: {
    skills: `${BASE}/bank/skills/`,
    questions: `${BASE}/bank/questions/`,
    question: (questionId: string) => `${BASE}/bank/questions/${questionId}/`,
  },

  assessments: {
    list: `${BASE}/assessments/`,
    create: `${BASE}/assessments/`,
    detail: (assessmentId: string) => `${BASE}/assessments/${assessmentId}/`,

    /** A section is one sitting: one domain, whatever skills, mixed levels. */
    sections: (assessmentId: string) => `${BASE}/assessments/${assessmentId}/sections/`,
    section: (assessmentId: string, sectionId: string) =>
      `${BASE}/assessments/${assessmentId}/sections/${sectionId}/`,

    /**
     * `PUT`, not `POST` — the client owns the ordered array and sends it whole,
     * so a retry after a dropped connection cannot leave duplicates behind.
     */
    sectionQuestions: (assessmentId: string, sectionId: string) =>
      `${BASE}/assessments/${assessmentId}/sections/${sectionId}/questions/`,

    /** What the paper can actually establish about a child. Poll it while authoring. */
    coverage: (assessmentId: string) => `${BASE}/assessments/${assessmentId}/coverage/`,

    /** One-way door: validates, mints the code, locks the paper. */
    publish: (assessmentId: string) => `${BASE}/assessments/${assessmentId}/publish/`,

    assignments: (assessmentId: string) => `${BASE}/assessments/${assessmentId}/assignments/`,
    assignment: (assessmentId: string, assignmentId: string) =>
      `${BASE}/assessments/${assessmentId}/assignments/${assignmentId}/`,
    roster: (assessmentId: string) => `${BASE}/assessments/${assessmentId}/assignments/roster/`,
    sendLink: (assessmentId: string, assignmentId: string) =>
      `${BASE}/assessments/${assessmentId}/assignments/${assignmentId}/send-link/`,
    sendLinks: (assessmentId: string) =>
      `${BASE}/assessments/${assessmentId}/assignments/send-links/`,

    results: (assessmentId: string) => `${BASE}/assessments/${assessmentId}/results/`,
    studentResponses: (assessmentId: string, studentId: string) =>
      `${BASE}/assessments/${assessmentId}/results/${studentId}/responses/`,
    reviewQueue: (assessmentId: string) => `${BASE}/assessments/${assessmentId}/review-queue/`,
    analytics: (assessmentId: string) => `${BASE}/assessments/${assessmentId}/analytics/`,
    analyticsRoster: (assessmentId: string) =>
      `${BASE}/assessments/${assessmentId}/analytics/roster/`,
  },

  students: {
    list: `${BASE}/students/`,
    detail: (studentId: string) => `${BASE}/students/${studentId}/`,
    // `/skills/` is the §5.5 contract for the per-skill breakdown; the student
    // profile screen still reads the pre-refactor `/learning-profile/` shape
    // via `profile` until it is rebuilt in Phase 4, so both stay wired.
    skills: (studentId: string) => `${BASE}/students/${studentId}/skills/`,
    profile: (studentId: string) => `${BASE}/students/${studentId}/learning-profile/`,
    lessonPlan: (studentId: string) => `${BASE}/students/${studentId}/lesson-plan/`,
  },

  classes: `${BASE}/classes/`,

  groups: {
    list: `${BASE}/groups/`,
    detail: (groupId: string) => `${BASE}/groups/${groupId}/`,
    members: (groupId: string) => `${BASE}/groups/${groupId}/members/`,
    member: (groupId: string, studentId: string) =>
      `${BASE}/groups/${groupId}/members/${studentId}/`,
    lessonPlan: (groupId: string) => `${BASE}/groups/${groupId}/lesson-plan/`,
  },

  lessonPlanFeedback: (lessonPlanId: string) => `${BASE}/lesson-plans/${lessonPlanId}/feedback/`,
} as const;
