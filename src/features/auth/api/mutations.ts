import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import {
  type LoginRequest,
  type RegisterRequest,
  registerResponseSchema,
  tokenPairResponseSchema,
} from '@/features/auth/api/auth.schema';
import { api } from '@/lib/api/client';
import { clearAuthToken, getRefreshToken, setAuthTokens } from '@/lib/auth/token-store';

/** `LoginView` — a SimpleJWT `TokenObtainPairView` subclass, so it accepts `email`/`password` and returns `{access, refresh, user}`. */
export function useLogin() {
  return useMutation({
    mutationFn: (input: LoginRequest) =>
      api.post('/v1/auth/login/', tokenPairResponseSchema, input),
    onSuccess: (data) => {
      setAuthTokens({ access: data.access, refresh: data.refresh });
    },
  });
}

/** `RegisterView` returns the created user only — it never authenticates the caller. */
export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterRequest) =>
      api.post('/v1/auth/register/', registerResponseSchema, input),
  });
}

const logoutResponseSchema = z.unknown();

/**
 * `LogoutView` blacklists the refresh token and requires it in the body.
 * Local tokens are cleared regardless of whether the backend call succeeds —
 * a refresh token that is already invalid should not leave the UI stuck in
 * a logged-in state it can no longer use.
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refresh = getRefreshToken();
      if (refresh) {
        await api.post('/v1/auth/logout/', logoutResponseSchema, { refresh });
      }
    },
    onSettled: () => {
      clearAuthToken();
      queryClient.clear();
    },
  });
}
