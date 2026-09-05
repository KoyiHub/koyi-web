import { queryOptions } from '@tanstack/react-query';

import { teacherEndpoints } from '@/features/teacher/api/endpoints';
import {
  groupDetailSchema,
  groupListSchema,
  groupMemberListSchema,
  lessonPlanSchema,
  studentLessonPlanSchema,
} from '@/features/teacher/groups/api/group.schema';
import { api } from '@/lib/api/client';

export const groupKeys = {
  all: ['teacher', 'groups'] as const,
  lists: () => [...groupKeys.all, 'list'] as const,
  list: (status: string) => [...groupKeys.lists(), status] as const,
  detail: (groupId: string) => [...groupKeys.all, 'detail', groupId] as const,
  members: (groupId: string, currentOnly: boolean) =>
    [...groupKeys.all, groupId, 'members', currentOnly] as const,
  lessonPlan: (groupId: string) => [...groupKeys.all, groupId, 'lesson-plan'] as const,
  studentLessonPlan: (studentId: string) =>
    [...groupKeys.all, 'student-lesson-plan', studentId] as const,
};

/** Unpaginated — a group is a small working set by design, never a whole-school roster. */
export const groupListQuery = (status = 'all') =>
  queryOptions({
    queryKey: groupKeys.list(status),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.groups.list, groupListSchema, {
        params: { status: status === 'all' ? undefined : status },
        signal,
      }),
    staleTime: 30_000,
  });

export const groupDetailQuery = (groupId: string) =>
  queryOptions({
    queryKey: groupKeys.detail(groupId),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.groups.detail(groupId), groupDetailSchema, { signal }),
  });

/** Membership history — every row, past and present. `current=true` filters to `left_at: null`. */
export const groupMembersQuery = (groupId: string, currentOnly = false) =>
  queryOptions({
    queryKey: groupKeys.members(groupId, currentOnly),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.groups.members(groupId), groupMemberListSchema, {
        params: { current: currentOnly || undefined },
        signal,
      }),
  });

/**
 * `POST` to generate returns `202` and runs in the background — poll this
 * `GET` until `status` leaves `generating`.
 */
export const groupLessonPlanQuery = (groupId: string) =>
  queryOptions({
    queryKey: groupKeys.lessonPlan(groupId),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.groups.lessonPlan(groupId), lessonPlanSchema, { signal }),
    refetchInterval: (query) => (query.state.data?.status === 'generating' ? 2000 : false),
  });

/** A `404` means the group plan already covers this child — the normal case, not a gap. */
export const studentLessonPlanQuery = (studentId: string) =>
  queryOptions({
    queryKey: groupKeys.studentLessonPlan(studentId),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.students.lessonPlan(studentId), studentLessonPlanSchema, {
        signal,
      }),
  });
