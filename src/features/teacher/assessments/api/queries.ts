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
  assignmentListSchema,
  rosterSchema,
} from '@/features/teacher/assessments/api/assignment.schema';
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
