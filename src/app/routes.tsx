import type { RouteObject } from 'react-router';

import { LandingLayout } from '@/app/landing-layout';
import { LoginLayout } from '@/app/login-layout';
import { RedirectIfAuthenticated, RequireAuth } from '@/app/require-auth';
import { RootErrorBoundary } from '@/app/root-error-boundary';
import { SchoolAdminLayout } from '@/app/school-admin-layout';
import { StudentAssessmentLayout } from '@/app/student-assessment-layout';
import { TeacherLayout } from '@/app/teacher-layout';

/**
 * Central route table. Every page is code-split via `lazy` so the initial
 * bundle carries only the shell; adding a route never grows the entry chunk.
 *
 * Route paths live in `@/config/paths` — never hand-write a URL string in a
 * component, so renames stay a one-file change.
 *
 * Four surfaces, in order:
 *   1. `/` — the public landing journey a visitor meets first.
 *   2. `/login/*` — the shared sign-in journey for both applications.
 *   3. `/school-admin/*` — the school administrator app.
 *   4. `/assessment/*` — the assessment runner, the surface a child touches.
 *   5. `/teacher/*` — the teacher app.
 *
 * The runner is deliberately top-level and never nested under `teacher`: a
 * child sitting an assessment holds a sitting session, not a teacher's JWT,
 * and `features/runner/**` may not import teacher modules (eslint.config.js).
 */
export const routes: RouteObject[] = [
  {
    Component: LandingLayout,
    ErrorBoundary: RootErrorBoundary,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('@/features/landing/routes/welcome-page')).WelcomePage,
        }),
      },
      {
        path: 'how-it-works',
        lazy: async () => ({
          Component: (await import('@/features/landing/routes/how-it-works-page')).HowItWorksPage,
        }),
      },
      {
        path: 'features',
        lazy: async () => ({
          Component: (await import('@/features/landing/routes/features-page')).FeaturesPage,
        }),
      },
      {
        path: 'get-started',
        lazy: async () => ({
          Component: (await import('@/features/landing/routes/get-started-page')).GetStartedPage,
        }),
      },
      {
        path: 'verify-email',
        lazy: async () => ({
          Component: (await import('@/features/landing/routes/verify-email-page')).VerifyEmailPage,
        }),
      },
      {
        path: 'ready',
        lazy: async () => ({
          Component: (await import('@/features/landing/routes/ready-page')).ReadyPage,
        }),
      },
      // Linked from the public nav; the pages themselves are not written yet.
      {
        path: 'about',
        lazy: async () => ({
          Component: (await import('@/features/landing/routes/marketing-pages')).AboutPage,
        }),
      },
      {
        path: 'contact',
        lazy: async () => ({
          Component: (await import('@/features/landing/routes/marketing-pages')).ContactPage,
        }),
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/app/not-found')).NotFound }),
      },
    ],
  },
  // Both applications sign in from here: `/login` asks which role you are, and
  // each form lives one segment below. `RedirectIfAuthenticated` guards the
  // individual forms rather than the whole branch — wrapping the branch would
  // bounce a signed-in admin off the chooser before they could pick a role.
  {
    path: 'login',
    ErrorBoundary: RootErrorBoundary,
    Component: LoginLayout,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('@/features/auth/routes/login-role-page')).LoginRolePage,
        }),
      },
      {
        Component: RedirectIfAuthenticated,
        children: [
          {
            path: 'school-admin',
            lazy: async () => ({
              Component: (
                await import('@/features/school-admin/auth/routes/school-admin-login-page')
              ).SchoolAdminLoginPage,
            }),
          },
          {
            path: 'teacher',
            lazy: async () => ({
              Component: (await import('@/features/auth/routes/teacher-login-page'))
                .TeacherLoginPage,
            }),
          },
        ],
      },
      // Not guarded: an admin reaching this step holds no tokens yet, and the
      // page sends anyone without a live challenge back to the form.
      {
        path: 'verify-device',
        lazy: async () => ({
          Component: (
            await import('@/features/school-admin/auth/routes/school-admin-verify-device-page')
          ).SchoolAdminVerifyDevicePage,
        }),
      },
      // Forgot/reset password. Not guarded, same reasoning as verify-device —
      // a visitor here holds no tokens yet.
      {
        path: 'school-admin/forgot-password',
        lazy: async () => ({
          Component: (
            await import('@/features/school-admin/auth/routes/school-admin-forgot-password-page')
          ).SchoolAdminForgotPasswordPage,
        }),
      },
      {
        path: 'teacher/forgot-password',
        lazy: async () => ({
          Component: (await import('@/features/auth/routes/teacher-forgot-password-page'))
            .TeacherForgotPasswordPage,
        }),
      },
      {
        path: 'teacher/reset-password',
        lazy: async () => ({
          Component: (await import('@/features/auth/routes/teacher-reset-password-page'))
            .TeacherResetPasswordPage,
        }),
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/app/not-found')).NotFound }),
      },
    ],
  },
  {
    path: 'school-admin',
    ErrorBoundary: RootErrorBoundary,
    children: [
      {
        Component: SchoolAdminLayout,
        children: [
          {
            path: 'dashboard',
            lazy: async () => ({
              Component: (await import('@/features/school-admin/dashboard/routes/dashboard-page'))
                .SchoolAdminDashboardPage,
            }),
          },
          {
            path: 'activity',
            lazy: async () => ({
              Component: (await import('@/features/school-admin/activity/routes/activity-page'))
                .ActivityPage,
            }),
          },
          {
            path: 'assessments',
            lazy: async () => ({
              Component: (
                await import('@/features/school-admin/assessments/routes/assessments-page')
              ).SchoolAssessmentsPage,
            }),
          },
          {
            path: 'teachers',
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import('@/features/school-admin/teachers/routes/teachers-page'))
                    .TeachersPage,
                }),
              },
              {
                path: 'new',
                lazy: async () => ({
                  Component: (
                    await import('@/features/school-admin/teachers/routes/add-teacher-page')
                  ).AddTeacherPage,
                }),
              },
              {
                path: ':teacherId',
                lazy: async () => ({
                  Component: (
                    await import('@/features/school-admin/teachers/routes/teacher-detail-page')
                  ).TeacherDetailPage,
                }),
              },
            ],
          },
          {
            path: 'students',
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import('@/features/school-admin/students/routes/students-page'))
                    .StudentsPage,
                }),
              },
              {
                path: 'new',
                lazy: async () => ({
                  Component: (
                    await import('@/features/school-admin/students/routes/add-student-page')
                  ).AddStudentPage,
                }),
              },
              {
                path: 'transfer',
                lazy: async () => ({
                  Component: (
                    await import('@/features/school-admin/students/routes/transfer-students-page')
                  ).TransferStudentsPage,
                }),
              },
              {
                path: ':studentId',
                lazy: async () => ({
                  Component: (
                    await import('@/features/school-admin/students/routes/student-detail-page')
                  ).StudentDetailPage,
                }),
              },
            ],
          },
          {
            path: 'classes',
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import('@/features/school-admin/classes/routes/classes-page'))
                    .ClassesPage,
                }),
              },
              {
                path: 'new',
                lazy: async () => ({
                  Component: (await import('@/features/school-admin/classes/routes/add-class-page'))
                    .AddClassPage,
                }),
              },
              {
                path: ':classId',
                lazy: async () => ({
                  Component: (
                    await import('@/features/school-admin/classes/routes/class-detail-page')
                  ).ClassDetailPage,
                }),
              },
            ],
          },
          {
            path: 'settings',
            lazy: async () => ({
              Component: (await import('@/features/school-admin/settings/routes/settings-page'))
                .SchoolAdminSettingsPage,
            }),
          },
          {
            path: 'help',
            lazy: async () => ({
              Component: (await import('@/features/school-admin/help/routes/help-page'))
                .SchoolAdminHelpPage,
            }),
          },
          {
            path: '*',
            lazy: async () => ({ Component: (await import('@/app/not-found')).NotFound }),
          },
        ],
      },
    ],
  },
  {
    // The assessment runner. Bare chrome, no sidebar, its own credential
    // scheme — a sitting session, not a teacher's JWT.
    path: 'assessment',
    ErrorBoundary: RootErrorBoundary,
    Component: StudentAssessmentLayout,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('@/features/runner/entry/routes/entry-page')).EntryPage,
        }),
      },
      {
        path: 'instructions',
        lazy: async () => ({
          Component: (await import('@/features/runner/instructions/routes/instructions-page'))
            .InstructionsPage,
        }),
      },
      {
        path: 'session',
        lazy: async () => ({
          Component: (await import('@/features/runner/session/fln-session-page')).FlnSessionPage,
        }),
      },
      {
        path: 'session/summary',
        lazy: async () => ({
          Component: (await import('@/features/runner/session/fln-summary-page')).FlnSummaryPage,
        }),
      },
    ],
  },
  {
    path: 'teacher',
    ErrorBoundary: RootErrorBoundary,
    children: [
      {
        Component: RequireAuth,
        children: [
          {
            Component: TeacherLayout,
            children: [
              {
                path: 'dashboard',
                children: [
                  {
                    index: true,
                    lazy: async () => ({
                      Component: (
                        await import('@/features/teacher/dashboard/routes/teacher-dashboard-page')
                      ).TeacherDashboardPage,
                    }),
                  },
                  // Each drill-down is one dashboard card's full story, so it
                  // nests under `dashboard` and the sidebar stays highlighted.
                  {
                    path: 'activity',
                    lazy: async () => ({
                      Component: (
                        await import('@/features/teacher/dashboard/routes/recent-activity-page')
                      ).RecentActivityPage,
                    }),
                  },
                  {
                    path: 'attention',
                    lazy: async () => ({
                      Component: (
                        await import('@/features/teacher/dashboard/routes/attention-page')
                      ).AttentionPage,
                    }),
                  },
                  {
                    path: 'ai-insights',
                    lazy: async () => ({
                      Component: (
                        await import('@/features/teacher/dashboard/routes/ai-insights-page')
                      ).AiInsightsPage,
                    }),
                  },
                  {
                    path: 'class-performance',
                    lazy: async () => ({
                      Component: (
                        await import('@/features/teacher/dashboard/routes/class-performance-page')
                      ).ClassPerformancePage,
                    }),
                  },
                ],
              },
              // Authoring and reviewing assessments. Distinct from
              // `assessment` (singular) above, which runs one with a child.
              {
                path: 'assessments',
                children: [
                  {
                    index: true,
                    lazy: async () => ({
                      Component: (
                        await import('@/features/teacher/assessments/routes/assessment-library-page')
                      ).AssessmentLibraryPage,
                    }),
                  },
                  {
                    path: 'create',
                    children: [
                      {
                        index: true,
                        lazy: async () => ({
                          Component: (
                            await import('@/features/teacher/assessments/routes/create-assessment-page')
                          ).CreateAssessmentPage,
                        }),
                      },
                      {
                        path: 'assign',
                        lazy: async () => ({
                          Component: (
                            await import('@/features/teacher/assessments/routes/assign-assessment-page')
                          ).AssignAssessmentPage,
                        }),
                      },
                    ],
                  },
                  {
                    path: ':assessmentId',
                    children: [
                      {
                        index: true,
                        lazy: async () => ({
                          Component: (
                            await import('@/features/teacher/assessments/routes/assessment-detail-page')
                          ).AssessmentDetailPage,
                        }),
                      },
                      {
                        path: 'analytics',
                        lazy: async () => ({
                          Component: (
                            await import('@/features/teacher/assessments/routes/assessment-analytics-page')
                          ).AssessmentAnalyticsPage,
                        }),
                      },
                      {
                        path: 'roster',
                        lazy: async () => ({
                          Component: (
                            await import('@/features/teacher/assessments/routes/roster-page')
                          ).RosterPage,
                        }),
                      },
                      {
                        path: 'responses/:studentId',
                        lazy: async () => ({
                          Component: (
                            await import('@/features/teacher/assessments/routes/response-review-page')
                          ).ResponseReviewPage,
                        }),
                      },
                      {
                        path: 'review-queue',
                        lazy: async () => ({
                          Component: (
                            await import('@/features/teacher/assessments/routes/review-queue-page')
                          ).ReviewQueuePage,
                        }),
                      },
                    ],
                  },
                ],
              },
              {
                path: 'students',
                children: [
                  {
                    index: true,
                    lazy: async () => ({
                      Component: (await import('@/features/teacher/students/routes/students-page'))
                        .StudentsPage,
                    }),
                  },
                  {
                    path: 'groups',
                    children: [
                      {
                        index: true,
                        lazy: async () => ({
                          Component: (await import('@/features/teacher/groups/routes/groups-page'))
                            .GroupsPage,
                        }),
                      },
                      {
                        path: ':groupId',
                        lazy: async () => ({
                          Component: (
                            await import('@/features/teacher/groups/routes/group-detail-page')
                          ).GroupDetailPage,
                        }),
                      },
                    ],
                  },
                  {
                    path: ':studentId',
                    lazy: async () => ({
                      Component: (
                        await import('@/features/teacher/students/routes/student-profile-page')
                      ).StudentProfilePage,
                    }),
                  },
                ],
              },
              {
                path: 'progress',
                lazy: async () => ({
                  Component: (await import('@/features/teacher/progress/routes/progress-page'))
                    .ProgressPage,
                }),
              },
              {
                path: 'question-bank',
                lazy: async () => ({
                  Component: (await import('@/features/teacher/bank/routes/question-bank-page'))
                    .QuestionBankPage,
                }),
              },
              {
                path: 'profile',
                lazy: async () => ({
                  Component: (await import('@/features/teacher/profile/routes/profile-page'))
                    .ProfilePage,
                }),
              },
              {
                path: 'settings',
                lazy: async () => ({
                  Component: (await import('@/features/teacher/routes/placeholder-pages'))
                    .TeacherSettingsPage,
                }),
              },
              {
                path: 'help',
                lazy: async () => ({
                  Component: (await import('@/features/teacher/routes/placeholder-pages'))
                    .TeacherHelpPage,
                }),
              },
              {
                path: '*',
                lazy: async () => ({ Component: (await import('@/app/not-found')).NotFound }),
              },
            ],
          },
        ],
      },
    ],
  },
];
