import type { RouteObject } from 'react-router';

import { AssessmentLayout } from '@/app/assessment-layout';
import { RootErrorBoundary } from '@/app/root-error-boundary';
import { TeacherLayout } from '@/app/teacher-layout';

/**
 * Central route table. Every page is code-split via `lazy` so the initial
 * bundle carries only the shell; adding a route never grows the entry chunk.
 *
 * Route paths live in `@/config/paths` — never hand-write a URL string in a
 * component, so renames stay a one-file change.
 *
 * The dashboard is the development landing screen; unbuilt sections resolve
 * to minimal placeholders so sidebar navigation always has somewhere to go.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: TeacherLayout,
    ErrorBoundary: RootErrorBoundary,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('@/features/dashboard/routes/dashboard-page')).DashboardPage,
        }),
      },
      {
        path: 'assessment',
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('@/features/assessment/routes/assessment-page'))
                .AssessmentPage,
            }),
          },
          {
            path: 'results',
            lazy: async () => ({
              Component: (await import('@/features/assessment/routes/assessment-results-page'))
                .AssessmentResultsPage,
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
              Component: (await import('@/features/students/routes/students-page')).StudentsPage,
            }),
          },
          {
            path: 'groups',
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import('@/features/students/routes/groups-page')).GroupsPage,
                }),
              },
              {
                path: ':groupId',
                lazy: async () => ({
                  Component: (await import('@/features/students/routes/group-detail-page'))
                    .GroupDetailPage,
                }),
              },
            ],
          },
          {
            path: ':studentId',
            lazy: async () => ({
              Component: (await import('@/features/students/routes/student-detail-page'))
                .StudentDetailPage,
            }),
          },
        ],
      },
      {
        path: 'progress',
        lazy: async () => ({
          Component: (await import('@/features/progress/routes/progress-page')).ProgressPage,
        }),
      },
      {
        path: 'profile',
        lazy: async () => ({
          Component: (await import('@/features/profile/routes/profile-page')).ProfilePage,
        }),
      },
      {
        path: 'users',
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('@/features/users/routes/users-page')).UsersPage,
            }),
          },
          {
            path: ':userId',
            lazy: async () => ({
              Component: (await import('@/features/users/routes/user-detail-page')).UserDetailPage,
            }),
          },
        ],
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/app/not-found')).NotFound }),
      },
    ],
  },
  {
    path: '/assessment/session',
    Component: AssessmentLayout,
    ErrorBoundary: RootErrorBoundary,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('@/features/assessment/routes/assessment-session-page'))
            .AssessmentSessionPage,
        }),
      },
      {
        path: 'complete',
        lazy: async () => ({
          Component: (await import('@/features/assessment/routes/assessment-complete-page'))
            .AssessmentCompletePage,
        }),
      },
    ],
  },
];
