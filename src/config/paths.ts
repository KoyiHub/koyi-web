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
  },

  teacher: {
    auth: {
      signup: '/teacher/signup',
    },

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

    /**
     * Running an assessment with a child, one question at a time. Distinct
     * from `assessments` below, which is the library of assessments a teacher
     * authors and assigns. Singular vs plural is load-bearing here.
     */
    assessment: {
      setup: '/teacher/assessment',
      session: '/teacher/assessment/session',
      complete: '/teacher/assessment/session/complete',
      results: '/teacher/assessment/results',
    },

    /** Authoring and reviewing assessments: library, builder, results. */
    assessments: {
      list: '/teacher/assessments',
      create: '/teacher/assessments/create',
      /** Step 2 of the builder — schedule and pick who sits it. */
      assign: '/teacher/assessments/create/assign',
      detail: (assessmentId: string) => `/teacher/assessments/${assessmentId}`,
      analytics: (assessmentId: string) => `/teacher/assessments/${assessmentId}/analytics`,
    },

    students: {
      list: '/teacher/students',
      detail: (studentId: string) => `/teacher/students/${studentId}`,
      groups: '/teacher/students/groups',
      groupDetail: (groupId: string) => `/teacher/students/groups/${groupId}`,
    },

    progress: '/teacher/progress',
    questionBank: '/teacher/question-bank',
    settings: '/teacher/settings',
    help: '/teacher/help',
    profile: '/teacher/profile',
    users: {
      list: '/teacher/users',
      detail: (userId: string | number) => `/teacher/users/${String(userId)}`,
    },
  },

  schoolAdmin: {
    // Admin accounts are created through the public landing journey
    // (`landing.getStarted`) and signed in through `login.schoolAdmin`, so
    // there are no auth routes under /school-admin/*.
    dashboard: '/school-admin/dashboard',
    teachers: {
      list: '/school-admin/teachers',
      new: '/school-admin/teachers/new',
      detail: (teacherId: string) => `/school-admin/teachers/${teacherId}`,
    },
    students: {
      list: '/school-admin/students',
      new: '/school-admin/students/new',
      detail: (studentId: string) => `/school-admin/students/${studentId}`,
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
