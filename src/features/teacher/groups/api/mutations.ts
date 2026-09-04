import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { teacherEndpoints } from '@/features/teacher/api/endpoints';
import {
  type CreateGroupInput,
  groupDetailSchema,
  groupListSchema,
  groupMemberSchema,
  lessonPlanSchema,
} from '@/features/teacher/groups/api/group.schema';
import { groupKeys } from '@/features/teacher/groups/api/queries';
import { api } from '@/lib/api/client';

/** A criteria set naming nothing is a `400` server-side — it would otherwise match everyone. */
export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGroupInput) =>
      api.post(teacherEndpoints.groups.list, groupDetailSchema, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
}

/** Forms groups automatically for shared weaknesses. */
export function useFormGroups() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(teacherEndpoints.groups.form, groupListSchema),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
}

/** Archives the group — the doc's `DELETE`, kept as a soft archive rather than destroying membership history. */
export function useArchiveGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) =>
      api.delete(teacherEndpoints.groups.detail(groupId), z.unknown()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
}

/** A child added by hand is never removed by the criteria — `join_reason: 'added'`. */
export function useAddGroupMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { groupId: string; studentId: string }) =>
      api.post(teacherEndpoints.groups.members(input.groupId), groupMemberSchema, {
        student_id: input.studentId,
      }),
    onSuccess: async (_data, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: groupKeys.detail(input.groupId) }),
        queryClient.invalidateQueries({ queryKey: groupKeys.members(input.groupId, true) }),
        queryClient.invalidateQueries({ queryKey: groupKeys.members(input.groupId, false) }),
      ]);
    },
  });
}

export function useRemoveGroupMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { groupId: string; studentId: string }) =>
      api.delete(teacherEndpoints.groups.member(input.groupId, input.studentId), z.unknown()),
    onSuccess: async (_data, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: groupKeys.detail(input.groupId) }),
        queryClient.invalidateQueries({ queryKey: groupKeys.members(input.groupId, true) }),
        queryClient.invalidateQueries({ queryKey: groupKeys.members(input.groupId, false) }),
      ]);
    },
  });
}

/** `202` — runs in the background. The lesson-plan query polls until `status` leaves `generating`. */
export function useGenerateGroupLessonPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) =>
      api.post(teacherEndpoints.groups.lessonPlan(groupId), lessonPlanSchema),
    onSuccess: async (_data, groupId) => {
      await queryClient.invalidateQueries({ queryKey: groupKeys.lessonPlan(groupId) });
    },
  });
}

/** Plans are advice, not documents — the only feedback is a thumbs up/down. */
export function useLessonPlanFeedback() {
  return useMutation({
    mutationFn: (input: { lessonPlanId: string; wasHelpful: boolean }) =>
      api.post(teacherEndpoints.lessonPlanFeedback(input.lessonPlanId), z.unknown(), {
        was_helpful: input.wasHelpful,
      }),
  });
}
