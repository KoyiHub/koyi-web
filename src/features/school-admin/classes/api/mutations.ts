import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import { classSchema } from '@/features/school-admin/classes/api/class.schema';
import { api } from '@/lib/api/client';

export interface CreateClassInput {
  gradeId: string;
  name: string;
}

/** Creates a class inside a grade — e.g. `Primary 3` + `Class A`. */
export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateClassInput) =>
      api.post(schoolAdminEndpoints.classes.list, classSchema, {
        grade: input.gradeId,
        name: input.name,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: schoolAdminKeys.classes() });
    },
  });
}

/** Refused with `400` while any student is still in the class — §4.3. */
export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId: string) =>
      api.delete(schoolAdminEndpoints.classes.detail(classId), z.unknown()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: schoolAdminKeys.classes() });
    },
  });
}
