import { queryOptions } from '@tanstack/react-query';

import { userListSchema, userSchema } from '@/features/users/api/user.schema';
import { api } from '@/lib/api/client';

/**
 * Query keys are built from one factory so cache invalidation is precise:
 * `userKeys.lists()` invalidates every list without touching detail entries.
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  detail: (userId: string) => [...userKeys.all, 'detail', userId] as const,
};

export const usersQuery = () =>
  queryOptions({
    queryKey: userKeys.lists(),
    queryFn: ({ signal }) => api.get('/users', userListSchema, { signal }),
  });

export const userQuery = (userId: string) =>
  queryOptions({
    queryKey: userKeys.detail(userId),
    queryFn: ({ signal }) => api.get(`/users/${userId}`, userSchema, { signal }),
  });
