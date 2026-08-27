import { useMutation, useQueryClient } from '@tanstack/react-query';

import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import { classDetailSchema } from '@/features/school-admin/classes/api/class.schema';
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
      api.post(schoolAdminEndpoints.classes.list, classDetailSchema, {
        grade_id: input.gradeId,
        name: input.name,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: schoolAdminKeys.classes() });
    },
  });
}
