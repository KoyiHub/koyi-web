import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import {
  type RegisterRequest,
  registerResponseSchema,
  teacherLoginResponseSchema,
} from '@/features/auth/api/auth.schema';
import { authEndpoints, provisionalAuthEndpoints } from '@/features/auth/api/endpoints';
import { api } from '@/lib/api/client';
import { clearAuthToken, getRefreshToken, setAuthTokens } from '@/lib/auth/token-store';

export interface TeacherLoginInput {
  teacherId: string;
  schoolId: string;
  password: string;
}

/**
 * Teacher sign-in. Teachers are issued a Teacher ID by their school rather
 * than registering an email themselves, so the credential pair is
 * (Teacher ID, School ID) plus a password.
 *
 * PROVISIONAL endpoint — see `api/endpoints.ts`. In development MSW answers
 * it; in a build without mocks it fails loudly rather than pretending to sign
 * anyone in.
 */
export function useTeacherLogin() {
  return useMutation({
    mutationFn: (input: TeacherLoginInput) =>
      api.post(provisionalAuthEndpoints.teacherLogin, teacherLoginResponseSchema, {
        teacher_id: input.teacherId,
        school_id: input.schoolId,
        password: input.password,
      }),
    onSuccess: (data) => {
      setAuthTokens({ access: data.access, refresh: data.refresh });
    },
  });
}

/** `RegisterView` returns the created user only — it never authenticates the caller. */
export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterRequest) =>
      api.post(authEndpoints.register, registerResponseSchema, input),
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
        await api.post(authEndpoints.logout, logoutResponseSchema, { refresh });
      }
    },
    onSettled: () => {
      clearAuthToken();
      queryClient.clear();
    },
  });
}
