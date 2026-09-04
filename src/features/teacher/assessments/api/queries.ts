import { queryOptions } from '@tanstack/react-query';

import { teacherEndpoints } from '@/features/teacher/api/endpoints';
import {
  assessmentListSchema,
  assessmentSchema,
  coverageSchema,
  sectionListSchema,
  sectionQuestionsSchema,
} from '@/features/teacher/assessments/api/assessment.schema';
import {
  assignableStudentListSchema,
  assignmentListSchema,
  rosterSchema,
  teacherClassListSchema,
} from '@/features/teacher/assessments/api/assignment.schema';
import {
  analyticsRosterSchema,
  analyticsSchema,
  resultsListSchema,
  reviewQueueListSchema,
  studentResponsesSchema,
} from '@/features/teacher/assessments/api/results.schema';
import { api } from '@/lib/api/client';

/**
 * Query keys for authoring.
 *
 * Nested under the assessment id so that saving one section's questions
 * invalidates that paper's coverage and detail without touching the library
 * list or another draft the teacher has open.
 */
export const assessmentKeys = {
  all: ['teacher', 'assessments'] as const,
  lists: () => [...assessmentKeys.all, 'list'] as const,
  list: (params: AssessmentListParams) => [...assessmentKeys.lists(), params] as const,
  detail: (id: string) => [...assessmentKeys.all, 'detail', id] as const,
  sections: (id: string) => [...assessmentKeys.all, id, 'sections'] as const,
  sectionQuestions: (id: string, sectionId: string) =>
    [...assessmentKeys.all, id, 'sections', sectionId, 'questions'] as const,
  coverage: (id: string) => [...assessmentKeys.all, id, 'coverage'] as const,
  assignments: (id: string) => [...assessmentKeys.all, id, 'assignments'] as const,
  roster: (id: string) => [...assessmentKeys.all, id, 'roster'] as const,
  classes: () => [...assessmentKeys.all, 'classes'] as const,
  assignableStudents: (params: AssignableStudentParams) =>
    [...assessmentKeys.all, 'assignable-students', params] as const,
  results: (id: string) => [...assessmentKeys.all, id, 'results'] as const,
  responses: (id: string, studentId: string) =>
    [...assessmentKeys.all, id, 'responses', studentId] as const,
  reviewQueue: (id: string) => [...assessmentKeys.all, id, 'review-queue'] as const,
  analytics: (id: string, narrative: boolean) =>
    [...assessmentKeys.all, id, 'analytics', narrative] as const,
  analyticsRoster: (id: string, filters: AnalyticsRosterFilters) =>
    [...assessmentKeys.all, id, 'analytics-roster', filters] as const,
};

export interface AssessmentListParams {
  search?: string | undefined;
  status?: string | undefined;
  page?: number | undefined;
}

export const assessmentsQuery = (params: AssessmentListParams = {}) =>
  queryOptions({
    queryKey: assessmentKeys.list(params),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.assessments.list, assessmentListSchema, {
        signal,
        params: params as Record<string, unknown>,
      }),
  });

export const assessmentQuery = (assessmentId: string) =>
  queryOptions({
    queryKey: assessmentKeys.detail(assessmentId),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.assessments.detail(assessmentId), assessmentSchema, { signal }),
  });

export const sectionsQuery = (assessmentId: string) =>
  queryOptions({
    queryKey: assessmentKeys.sections(assessmentId),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.assessments.sections(assessmentId), sectionListSchema, { signal }),
  });

export const sectionQuestionsQuery = (assessmentId: string, sectionId: string) =>
  queryOptions({
    queryKey: assessmentKeys.sectionQuestions(assessmentId, sectionId),
    queryFn: ({ signal }) =>
      api.get(
        teacherEndpoints.assessments.sectionQuestions(assessmentId, sectionId),
        sectionQuestionsSchema,
        { signal },
      ),
  });

/**
 * Coverage — what the paper can actually establish about a child.
 *
 * Read it **while the teacher builds**, not only before publishing: a paper
 * that probes one level cannot place anyone, and that is worth knowing at
 * question three rather than at publish.
 */
export const coverageQuery = (assessmentId: string) =>
  queryOptions({
    queryKey: assessmentKeys.coverage(assessmentId),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.assessments.coverage(assessmentId), coverageSchema, { signal }),
  });

export const assignmentsQuery = (assessmentId: string) =>
  queryOptions({
    queryKey: assessmentKeys.assignments(assessmentId),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.assessments.assignments(assessmentId), assignmentListSchema, {
        signal,
      }),
  });

export const rosterQuery = (assessmentId: string) =>
  queryOptions({
    queryKey: assessmentKeys.roster(assessmentId),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.assessments.roster(assessmentId), rosterSchema, { signal }),
  });

/** The teacher's own classes — for the "whole class" assignment mode. */
export const classesQuery = () =>
  queryOptions({
    queryKey: assessmentKeys.classes(),
    queryFn: ({ signal }) => api.get(teacherEndpoints.classes, teacherClassListSchema, { signal }),
    staleTime: 5 * 60_000,
  });

export interface AssignableStudentParams {
  search?: string | undefined;
  page?: number | undefined;
}

/** The individual-student picker for assignment. See `assignableStudentSchema`'s note. */
export const assignableStudentsQuery = (params: AssignableStudentParams = {}) =>
  queryOptions({
    queryKey: assessmentKeys.assignableStudents(params),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.students.list, assignableStudentListSchema, {
        signal,
        params: params as Record<string, unknown>,
      }),
    placeholderData: (previous) => previous,
  });

/* -------------------------------------------------------------------------- */
/* Results, analytics and review — frontend-integration.md §5.5              */
/* -------------------------------------------------------------------------- */

/** Every assigned child: progress, score, level. Folded into the analytics page as a table. */
export const resultsQuery = (assessmentId: string) =>
  queryOptions({
    queryKey: assessmentKeys.results(assessmentId),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.assessments.results(assessmentId), resultsListSchema, { signal }),
  });

/** One child's paper, in sitting order, annotated with what happened. */
export const studentResponsesQuery = (assessmentId: string, studentId: string) =>
  queryOptions({
    queryKey: assessmentKeys.responses(assessmentId, studentId),
    queryFn: ({ signal }) =>
      api.get(
        teacherEndpoints.assessments.studentResponses(assessmentId, studentId),
        studentResponsesSchema,
        { signal },
      ),
  });

/** Responses the AI could not settle — read-only, no resolution endpoint exists yet. */
export const reviewQueueQuery = (assessmentId: string) =>
  queryOptions({
    queryKey: assessmentKeys.reviewQueue(assessmentId),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.assessments.reviewQueue(assessmentId), reviewQueueListSchema, {
        signal,
      }),
  });

/**
 * Numbers computed deterministically, with an AI narrative laid over them.
 * `narrative: false` skips generating the prose — the key stays `null`
 * rather than being dropped, so a tile that doesn't want it need not branch
 * on key existence.
 */
export const analyticsQuery = (assessmentId: string, narrative = true) =>
  queryOptions({
    queryKey: assessmentKeys.analytics(assessmentId, narrative),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.assessments.analytics(assessmentId), analyticsSchema, {
        signal,
        params: { narrative },
      }),
  });

export interface AnalyticsRosterFilters {
  domain?: string | undefined;
  level?: string | undefined;
}

/** Who needs help — filterable by domain/level. */
export const analyticsRosterQuery = (assessmentId: string, filters: AnalyticsRosterFilters = {}) =>
  queryOptions({
    queryKey: assessmentKeys.analyticsRoster(assessmentId, filters),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.assessments.analyticsRoster(assessmentId), analyticsRosterSchema, {
        signal,
        params: filters as Record<string, unknown>,
      }),
  });
