import { useMutation } from '@tanstack/react-query';

import { schoolAuthEndpoints } from '@/features/school-admin/auth/api/endpoints';
import {
  confirmPasswordResetResponseSchema,
  requestPasswordResetResponseSchema,
  verifyPasswordResetResponseSchema,
} from '@/features/school-admin/auth/api/password-reset.schema';
import {
  schoolAdminLoginResponseSchema,
  schoolAdminVerifyDeviceResponseSchema,
} from '@/features/school-admin/auth/api/school-admin-auth.schema';
import { api } from '@/lib/api/client';
import { setAuthTokens } from '@/lib/auth/token-store';

/**
 * School Admin account creation and sign-in.
 *
 * `frontend-integration.md` §4.1. The hooks keep the exact shape a real
 * mutation has (`mutateAsync`, `isPending`, `error`), so the screens never
 * change when the real API is swapped in — only `endpoints.ts` and the
 * response schemas do.
 */
export interface SchoolAdminLoginInput {
  email: string;
  password: string;
}

export interface SchoolAdminVerifyDeviceInput {
  challenge: string;
  code: string;
}

/**
 * Sign in a school admin. Tokens are stored only on the branch where the
 * backend actually issued them — `otp_required: true` comes back with a
 * challenge and no tokens, and must clear `useSchoolAdminVerifyDevice` first.
 */
export function useSchoolAdminLogin() {
  return useMutation({
    mutationFn: (input: SchoolAdminLoginInput) =>
      api.post(schoolAuthEndpoints.login, schoolAdminLoginResponseSchema, {
        email: input.email,
        password: input.password,
      }),
    onSuccess: (data) => {
      if (!data.otp_required) {
        setAuthTokens({ access: data.access, refresh: data.refresh });
      }
    },
  });
}

export function useSchoolAdminVerifyDevice() {
  return useMutation({
    mutationFn: (input: SchoolAdminVerifyDeviceInput) =>
      api.post(schoolAuthEndpoints.loginVerify, schoolAdminVerifyDeviceResponseSchema, {
        challenge: input.challenge,
        code: input.code,
      }),
    onSuccess: (data) => {
      setAuthTokens({ access: data.access, refresh: data.refresh });
    },
  });
}

/**
 * Password reset — three steps, OTP-code based. **Always resolves** on the
 * request step regardless of whether the address is registered; the form
 * says "if that address is registered, a code is on its way," never
 * "code sent" (§4.1's anti-enumeration rule).
 */
export function useRequestSchoolPasswordReset() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post(schoolAuthEndpoints.resetPasswordRequest, requestPasswordResetResponseSchema, {
        email,
      }),
  });
}

export function useVerifySchoolPasswordReset() {
  return useMutation({
    mutationFn: (input: { email: string; code: string }) =>
      api.post(schoolAuthEndpoints.resetPasswordVerify, verifyPasswordResetResponseSchema, input),
  });
}

export function useConfirmSchoolPasswordReset() {
  return useMutation({
    mutationFn: (input: { reset_token: string; password: string }) =>
      api.post(schoolAuthEndpoints.resetPasswordConfirm, confirmPasswordResetResponseSchema, input),
  });
}
