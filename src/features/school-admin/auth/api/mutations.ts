import { useMutation } from '@tanstack/react-query';

import { schoolAuthEndpoints } from '@/features/school-admin/auth/api/endpoints';
import {
  schoolAdminLoginResponseSchema,
  schoolAdminVerifyDeviceResponseSchema,
} from '@/features/school-admin/auth/api/school-admin-auth.schema';
import { api } from '@/lib/api/client';
import { setAuthTokens } from '@/lib/auth/token-store';

/**
 * School Admin account creation and sign-in.
 *
 * The School Portal API is not published yet, so every URL here is
 * provisional (see `endpoints.ts`) and MSW answers it in development. The
 * hooks keep the exact shape a real mutation has (`mutateAsync`, `isPending`,
 * `error`), so the screens never change when the real API is swapped in —
 * only `endpoints.ts` and the response schemas do.
 */
export interface SchoolAdminSignupInput {
  schoolName: string;
  administratorName: string;
  email: string;
  password: string;
}

export interface SchoolAdminLoginInput {
  email: string;
  password: string;
  /** Asks the backend to trust this device, which is what skips the code step. */
  rememberMe?: boolean | undefined;
}

export interface SchoolAdminVerifyDeviceInput {
  challengeId: string;
  code: string;
}

/**
 * Admin accounts are created through the public school onboarding journey
 * (`paths.landing.getStarted`), which has its own registration call. There is
 * no separate admin signup endpoint, so this stub is intentionally not wired
 * to a URL — it exists only so a future direct-signup screen has somewhere to
 * land.
 */
export function useSchoolAdminSignup() {
  return useMutation({
    mutationFn: (_input: SchoolAdminSignupInput): Promise<never> =>
      Promise.reject(
        new Error('School Admin accounts are created through the school onboarding journey.'),
      ),
  });
}

/**
 * Sign in a school admin. Tokens are stored only on the branch where the
 * backend actually issued them — an unrecognised device comes back with a
 * challenge and no tokens, and must clear `useSchoolAdminVerifyDevice` first.
 */
export function useSchoolAdminLogin() {
  return useMutation({
    mutationFn: (input: SchoolAdminLoginInput) =>
      api.post(schoolAuthEndpoints.login, schoolAdminLoginResponseSchema, {
        email: input.email,
        password: input.password,
        remember_device: input.rememberMe ?? false,
      }),
    onSuccess: (data) => {
      if (!data.verification_required) {
        setAuthTokens({ access: data.access, refresh: data.refresh });
      }
    },
  });
}

export function useSchoolAdminVerifyDevice() {
  return useMutation({
    mutationFn: (input: SchoolAdminVerifyDeviceInput) =>
      api.post(schoolAuthEndpoints.loginVerify, schoolAdminVerifyDeviceResponseSchema, {
        challenge_id: input.challengeId,
        code: input.code,
      }),
    onSuccess: (data) => {
      setAuthTokens({ access: data.access, refresh: data.refresh });
    },
  });
}
