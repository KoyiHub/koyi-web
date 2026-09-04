import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import {
  deleteRequestSchema,
  teacherPasswordResetSchema,
  teacherSchema,
} from '@/features/school-admin/teachers/api/teacher.schema';
import { api } from '@/lib/api/client';

export interface CreateTeacherInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  classId: string;
}

/** Creates a teacher account and, optionally, places them in a class. */
export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTeacherInput) =>
      api.post(schoolAdminEndpoints.teachers.list, teacherSchema, {
        email: input.email,
        password: input.password,
        first_name: input.firstName,
        last_name: input.lastName,
        school_class: input.classId || null,
      }),
    onSuccess: async () => {
      // The roster count on the classes screen moves too, so both lists go.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: schoolAdminKeys.teachers() }),
        queryClient.invalidateQueries({ queryKey: schoolAdminKeys.classes() }),
      ]);
    },
  });
}

/**
 * Emails a reset link — `frontend-integration.md` §4.4. Unlike the modal
 * this replaces, no password or mode is chosen here: the server owns
 * generating and delivering the credential, and never echoes it back.
 */
export function useResetTeacherPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teacherId: string) =>
      api.post(schoolAdminEndpoints.teachers.passwordReset(teacherId), teacherPasswordResetSchema),
    onSuccess: async (_data, teacherId) => {
      await queryClient.invalidateQueries({ queryKey: schoolAdminKeys.teacherDetail(teacherId) });
    },
  });
}

function invalidateTeacher(queryClient: ReturnType<typeof useQueryClient>, teacherId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: schoolAdminKeys.teacherDetail(teacherId) }),
    queryClient.invalidateQueries({ queryKey: schoolAdminKeys.teachers() }),
  ]);
}

export function useDisableTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teacherId: string) =>
      api.post(schoolAdminEndpoints.teachers.disable(teacherId), teacherSchema),
    onSuccess: (_data, teacherId) => invalidateTeacher(queryClient, teacherId),
  });
}

export function useEnableTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teacherId: string) =>
      api.post(schoolAdminEndpoints.teachers.enable(teacherId), teacherSchema),
    onSuccess: (_data, teacherId) => invalidateTeacher(queryClient, teacherId),
  });
}

/** Two-step delete behind an emailed 2FA code — `frontend-integration.md` §4.4. */
export function useRequestTeacherDelete() {
  return useMutation({
    mutationFn: (teacherId: string) =>
      api.post(schoolAdminEndpoints.teachers.deleteRequest(teacherId), deleteRequestSchema),
  });
}

export function useConfirmTeacherDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { teacherId: string; code: string }) =>
      api.post(schoolAdminEndpoints.teachers.deleteConfirm(input.teacherId), z.unknown(), {
        code: input.code,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: schoolAdminKeys.teachers() });
    },
  });
}
