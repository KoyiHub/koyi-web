import { queryOptions } from '@tanstack/react-query';

import { authUserSchema } from '@/features/auth/api/auth.schema';
import { teacherAuthEndpoints } from '@/features/auth/api/endpoints';
import { api } from '@/lib/api/client';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

/** The acting teacher's own record. Surface-specific: school admins read `/v1/school/profile/`. */
export const meQuery = () =>
  queryOptions({
    queryKey: authKeys.me(),
    queryFn: ({ signal }) => api.get(teacherAuthEndpoints.me, authUserSchema, { signal }),
  });
