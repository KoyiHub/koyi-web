import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { teacherEndpoints } from '@/features/teacher/api/endpoints';
import {
  assessmentSchema,
  type AuthoredQuestion,
  type CreateAssessmentInput,
  type CreateSectionInput,
  sectionQuestionsSchema,
  sectionSchema,
} from '@/features/teacher/assessments/api/assessment.schema';
import {
  type AssignInput,
  createdAssignmentsSchema,
  sendLinksResultSchema,
} from '@/features/teacher/assessments/api/assignment.schema';
import { assessmentKeys } from '@/features/teacher/assessments/api/queries';
import { api } from '@/lib/api/client';

/**
 * Every write in the draft-then-publish authoring flow —
 * `frontend-integration.md` §5.3–§5.4.
 *
 * Each mutation invalidates narrowly: saving one section's questions should
 * not refetch a sibling section or another draft the teacher has open, but it
 * must always invalidate that paper's coverage, because coverage is the one
 * screen meant to be watched live while authoring.
 */

/** Step 1. Creates the draft and returns its id — every later call targets it. */
export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAssessmentInput) =>
      api.post(teacherEndpoints.assessments.create, assessmentSchema, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
    },
  });
}

export function useUpdateAssessment(assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CreateAssessmentInput>) =>
      api.patch(teacherEndpoints.assessments.detail(assessmentId), assessmentSchema, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(assessmentId) });
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
    },
  });
}

export function useDeleteAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) =>
      // DELETE has no response body to speak of; z.unknown() accepts whatever
      // (or nothing) comes back rather than asserting a shape that isn't there.
      api.delete(teacherEndpoints.assessments.detail(assessmentId), z.unknown()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
    },
  });
}

/** Step 2, called once per sitting. */
export function useCreateSection(assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSectionInput) =>
      api.post(teacherEndpoints.assessments.sections(assessmentId), sectionSchema, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.sections(assessmentId) });
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(assessmentId) });
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.coverage(assessmentId) });
    },
  });
}

export function useUpdateSection(assessmentId: string, sectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CreateSectionInput>) =>
      api.patch(
        teacherEndpoints.assessments.section(assessmentId, sectionId),
        sectionSchema,
        input,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.sections(assessmentId) });
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.coverage(assessmentId) });
    },
  });
}

export function useDeleteSection(assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sectionId: string) =>
      api.delete(teacherEndpoints.assessments.section(assessmentId, sectionId), z.unknown()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.sections(assessmentId) });
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.coverage(assessmentId) });
    },
  });
}

/**
 * Step 3. `PUT`s the whole ordered array for one section.
 *
 * **Never send a partial list.** The client owns the array in local state and
 * replaces the section's questions wholesale on every save — a retry after a
 * dropped connection then cannot leave duplicates behind, because the server
 * has no "append" to retry into. Order comes from array position, not from any
 * field on the question.
 */
export function useReplaceSectionQuestions(assessmentId: string, sectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questions: AuthoredQuestion[]) =>
      api.put(
        teacherEndpoints.assessments.sectionQuestions(assessmentId, sectionId),
        sectionQuestionsSchema,
        { questions },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: assessmentKeys.sectionQuestions(assessmentId, sectionId),
      });
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(assessmentId) });
      // Coverage is the screen meant to be watched live while authoring, so it
      // refetches after every save rather than waiting for a manual refresh.
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.coverage(assessmentId) });
    },
  });
}

/**
 * Step 5. No body. Validates, mints the code, locks the paper.
 *
 * Irreversible — confirm with the teacher before calling this, and once it
 * succeeds hide every edit and delete control for this paper rather than
 * leaving them to fail with `400`.
 */
export function usePublishAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) =>
      api.post(teacherEndpoints.assessments.publish(assessmentId), assessmentSchema),
    onSuccess: (_data, assessmentId) => {
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(assessmentId) });
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
    },
  });
}

/**
 * Assigns a paper to students, classes, or every student the teacher has.
 *
 * Returns only the newly created assignments — assigning twice is a
 * deliberate no-op, so an empty array is a normal result, not a failure.
 */
export function useAssignStudents(assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AssignInput) =>
      api.post(
        teacherEndpoints.assessments.assignments(assessmentId),
        createdAssignmentsSchema,
        input,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.assignments(assessmentId) });
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.roster(assessmentId) });
    },
  });
}

/** Refused with `400` once a child has started — only `not_started` can be withdrawn. */
export function useWithdrawAssignment(assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: string) =>
      api.delete(teacherEndpoints.assessments.assignment(assessmentId, assignmentId), z.unknown()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.assignments(assessmentId) });
    },
  });
}

/**
 * Guardian links — sent **on demand**, never automatically on assignment. A
 * paper is often assigned days before it opens, and the teacher decides when a
 * guardian should hear about it. Email is the only channel; there is no SMS
 * affordance anywhere this hook is used.
 */
export function useSendGuardianLink(assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: string) =>
      api.post(
        teacherEndpoints.assessments.sendLink(assessmentId, assignmentId),
        sendLinksResultSchema,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.assignments(assessmentId) });
    },
  });
}

export function useSendGuardianLinks(assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentIds: string[]) =>
      api.post(teacherEndpoints.assessments.sendLinks(assessmentId), sendLinksResultSchema, {
        assignment_ids: assignmentIds,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.assignments(assessmentId) });
    },
  });
}
