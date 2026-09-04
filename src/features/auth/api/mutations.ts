import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { teacherLoginResponseSchema } from '@/features/auth/api/auth.schema';
import { authEndpoints, teacherAuthEndpoints } from '@/features/auth/api/endpoints';
import {
  confirmTeacherPasswordResetResponseSchema,
  requestTeacherPasswordResetResponseSchema,
} from '@/features/auth/api/password-reset.schema';
import { api } from '@/lib/api/client';
import { clearAuthToken, getRefreshToken, setAuthTokens } from '@/lib/auth/token-store';

export interface TeacherLoginInput {
  teacherId: string;
  password: string;
}

/**
 * Teacher sign-in.
 *
 * Teachers do not register themselves — a school admin creates the account and
 * the school issues the teacher id — so this is the only way into the teacher
 * surface. The id is the credential; there is no school field, because the id
 * already carries the school's abbreviation as a prefix.
 */
export function useTeacherLogin() {
  return useMutation({
    mutationFn: (input: TeacherLoginInput) =>
      api.post(teacherAuthEndpoints.login, teacherLoginResponseSchema, {
        teacher_id: input.teacherId,
        password: input.password,
      }),
    onSuccess: (data) => {
      setAuthTokens({ access: data.access, refresh: data.refresh });
    },
  });
}

/**
 * Password reset — code-based, like the school admin flow. The request step
 * always resolves, so the form can never be used to discover which teacher
 * ids exist.
 */
export function useRequestTeacherPasswordReset() {
  return useMutation({
    mutationFn: (teacherId: string) =>
      api.post(
        teacherAuthEndpoints.resetPasswordRequest,
        requestTeacherPasswordResetResponseSchema,
        { teacher_id: teacherId },
      ),
  });
}

export function useConfirmTeacherPasswordReset() {
  return useMutation({
    mutationFn: (input: {
      teacherId: string;
      code: string;
      password: string;
      passwordConfirm: string;
    }) =>
      api.post(
        teacherAuthEndpoints.resetPasswordConfirm,
        confirmTeacherPasswordResetResponseSchema,
        {
          teacher_id: input.teacherId,
          code: input.code,
          password: input.password,
          password_confirm: input.passwordConfirm,
        },
      ),
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
