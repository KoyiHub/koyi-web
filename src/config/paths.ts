/**
 * The single source of truth for URLs. Components and tests build links from
 * here, so changing a path is one edit instead of a grep-and-pray.
 *
 * Four top-level namespaces, deliberately kept apart:
 *
 * - `landing`   — the public six-step entry journey, rooted at "/".
 * - `login`     — the shared sign-in journey, all under /login/*.
 * - `teacher`   — the Teacher application, all under /teacher/*.
 * - `schoolAdmin` — the School Admin application, all under /school-admin/*.
 *
 * Teacher and School Admin are separate applications per product
 * requirements; namespacing them here makes an accidental cross-link a
 * type error rather than a runtime surprise.
 *
 * There is no teacher signup path: a school admin creates teacher accounts,
 * so self-registration would produce logins that belong to no school.
 */
export const paths = {
  /** Public six-step onboarding journey. Step order is defined in `@/config/landing-steps`. */
  landing: {
    welcome: '/',
    howItWorks: '/how-it-works',
    features: '/features',
    getStarted: '/get-started',
    verifyEmail: '/verify-email',
    ready: '/ready',
  },

  /** Top-nav destinations that are intentionally not built yet. */
  marketing: {
    about: '/about',
    contact: '/contact',
  },

  /**
   * Signing in is shared: one entry point asks which role you hold, then hands
   * off to that role's form. It sits outside `teacher`/`schoolAdmin` because
   * a visitor at `/login` has not picked an application yet.
   */
  login: {
    chooser: '/login',
    schoolAdmin: '/login/school-admin',
    teacher: '/login/teacher',
    /** Device check an admin login can be sent to when the backend asks for one. */
    verifyDevice: '/login/verify-device',
    /** Three-step OTP-code wizard: email → code → new password (§4.1). */
    schoolAdminForgotPassword: '/login/school-admin/forgot-password',
    /** Requests an emailed reset link — a teacher never enters a code here. */
    teacherForgotPassword: '/login/teacher/forgot-password',
    /** Where the emailed link lands, `?token=...` in hand, to set a new password. */
    teacherResetPassword: '/login/teacher/reset-password',
  },

  /**
   * The assessment runner — the surface a child touches. Deliberately outside
   * `teacher`: a child holds a sitting session, not a teacher's JWT, and the
   * runner renders its own bare chrome with no sidebar.
   */
  assessment: {
    /** The two-code sign-in. Accepts `?a=<assessment>&c=<personal>` from a guardian link. */
    entry: '/assessment',
    /** The section hub — returned to after every section submit. */
    instructions: '/assessment/instructions',
    session: '/assessment/session',
    summary: '/assessment/session/summary',
  },

  teacher: {
    dashboard: '/teacher/dashboard',

    /**
     * Drill-downs opened from a dashboard card. They live under
     * `/teacher/dashboard/*` because each one is that card's full story, not a
     * separate section of the app — the sidebar keeps Dashboard highlighted.
     */
    insights: {
      recentActivity: '/teacher/dashboard/activity',
      attention: '/teacher/dashboard/attention',
      aiInsights: '/teacher/dashboard/ai-insights',
      classPerformance: '/teacher/dashboard/class-performance',
    },

    /** Authoring and reviewing assessments: library, builder, results. */
    assessments: {
      list: '/teacher/assessments',
      create: '/teacher/assessments/create',
      /**
       * Step 2 of the builder — schedule and pick who sits it. A fixed path
       * rather than `/:assessmentId/assign` so it reads as "the next builder
       * step", but it still needs `?assessmentId=` — build the link with
       * `assignFor`, don't hand-roll the query string.
       */
      assign: '/teacher/assessments/create/assign',
      assignFor: (assessmentId: string) =>
        `/teacher/assessments/create/assign?assessmentId=${assessmentId}`,
      detail: (assessmentId: string) => `/teacher/assessments/${assessmentId}`,
      analytics: (assessmentId: string) => `/teacher/assessments/${assessmentId}/analytics`,
      /** The printable code sheet — one row per assigned child. */
      roster: (assessmentId: string) => `/teacher/assessments/${assessmentId}/roster`,
      /** One child's paper, question by question — green/red straight from `is_correct`/`was_selected`. */
      responses: (assessmentId: string, studentId: string) =>
        `/teacher/assessments/${assessmentId}/responses/${studentId}`,
      /** Responses the AI could not settle. Read-only — no resolution endpoint exists yet. */
      reviewQueue: (assessmentId: string) => `/teacher/assessments/${assessmentId}/review-queue`,
    },

    students: {
      list: '/teacher/students',
      detail: (studentId: string) => `/teacher/students/${studentId}`,
    },

    groups: {
      list: '/teacher/groups',
      detail: (groupId: string) => `/teacher/groups/${groupId}`,
    },

    progress: '/teacher/progress',
    questionBank: '/teacher/question-bank',
    settings: '/teacher/settings',
    help: '/teacher/help',
    profile: '/teacher/profile',
  },

  schoolAdmin: {
    // Admin accounts are created through the public landing journey
    // (`landing.getStarted`) and signed in through `login.schoolAdmin`, so
    // there are no auth routes under /school-admin/*.
    dashboard: '/school-admin/dashboard',
    /** Server-authored feed of who-did-what — §4.6. Rendered verbatim, never reconstructed. */
    activity: '/school-admin/activity',
    /** School-wide oversight, not authoring — §4.8. */
    assessments: '/school-admin/assessments',
    teachers: {
      list: '/school-admin/teachers',
      new: '/school-admin/teachers/new',
      detail: (teacherId: string) => `/school-admin/teachers/${teacherId}`,
    },
    students: {
      list: '/school-admin/students',
      new: '/school-admin/students/new',
      detail: (studentId: string) => `/school-admin/students/${studentId}`,
      /** Multi-select and whole-class bulk moves — §4.5. */
      transfer: '/school-admin/students/transfer',
    },
    classes: {
      list: '/school-admin/classes',
      new: '/school-admin/classes/new',
      detail: (classId: string) => `/school-admin/classes/${classId}`,
    },
    settings: '/school-admin/settings',
    help: '/school-admin/help',
  },
} as const;
