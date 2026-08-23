import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { userKeys } from '@/features/users/api/queries';
import { userSchema } from '@/features/users/api/user.schema';
import { api } from '@/lib/api/client';

export const createUserInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => api.post('/users', userSchema, input),
    onSuccess: async () => {
      // Invalidate lists only — cached detail pages are still valid.
      await queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
