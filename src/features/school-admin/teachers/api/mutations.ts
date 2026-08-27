import { useMutation, useQueryClient } from '@tanstack/react-query';

import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import {
  teacherDetailSchema,
  teacherPasswordResetSchema,
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
      api.post(schoolAdminEndpoints.teachers.list, teacherDetailSchema, {
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        password: input.password,
        class_id: input.classId || null,
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

export type ResetTeacherPasswordInput =
  | { teacherId: string; mode: 'generate' }
  | { teacherId: string; mode: 'manual'; password: string; confirmPassword: string };

/**
 * Resets a teacher's password.
 *
 * Two modes, the admin's choice: ask the server to generate a temporary
 * password (returned once so it can be handed over, and flagged
 * must-change-on-next-login), or set one manually. Generation happens on the
 * server — the browser never invents a credential — and a manually set
 * password is never echoed back in the response.
 */
export function useResetTeacherPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ResetTeacherPasswordInput) =>
      api.post(
        schoolAdminEndpoints.teachers.resetPassword(input.teacherId),
        teacherPasswordResetSchema,
        input.mode === 'manual'
          ? { mode: 'manual', password: input.password, confirm_password: input.confirmPassword }
          : { mode: 'generate' },
      ),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: schoolAdminKeys.teacherDetail(variables.teacherId),
      });
    },
  });
}
