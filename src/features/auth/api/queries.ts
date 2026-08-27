import { queryOptions } from '@tanstack/react-query';

import { authUserSchema } from '@/features/auth/api/auth.schema';
import { authEndpoints } from '@/features/auth/api/endpoints';
import { api } from '@/lib/api/client';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

/** `MeView` — the authenticated user's own record. */
export const meQuery = () =>
  queryOptions({
    queryKey: authKeys.me(),
    queryFn: ({ signal }) => api.get(authEndpoints.me, authUserSchema, { signal }),
  });
