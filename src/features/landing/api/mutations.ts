import { useMutation } from '@tanstack/react-query';

import { schoolAuthEndpoints } from '@/features/landing/api/endpoints';
import {
  registerSchoolResponseSchema,
  resendVerificationResponseSchema,
  verifyEmailResponseSchema,
} from '@/features/landing/api/school-onboarding.schema';
import { api } from '@/lib/api/client';
import { setAuthTokens } from '@/lib/auth/token-store';

/** `frontend-integration.md` §4.1 — the register request body, verbatim field for field. */
export interface RegisterSchoolInput {
  name: string;
  /** 2–12 uppercase letters/digits, globally unique, immutable after registration. */
  abbreviation: string;
  email: string;
  password: string;
  password_confirm: string;
  class_system: 'grade' | 'primary';
}

export interface VerifyEmailInput {
  email: string;
  code: string;
}

export interface ResendVerificationInput {
  email: string;
}

/**
 * School onboarding calls. These go through the normal api client and Zod
 * response schemas; in development MSW answers them (see
 * `src/mocks/handlers.ts`). Swapping to the real Django API is a change of
 * URL in `endpoints.ts`, not a change to any screen.
 */
export function useRegisterSchool() {
  return useMutation({
    mutationFn: (input: RegisterSchoolInput) =>
      api.post(schoolAuthEndpoints.register, registerSchoolResponseSchema, input),
  });
}

/** Verifying the email is what issues tokens — registering alone does not sign the school in. */
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (input: VerifyEmailInput) =>
      api.post(schoolAuthEndpoints.registerVerify, verifyEmailResponseSchema, input),
    onSuccess: (data) => {
      setAuthTokens({ access: data.access, refresh: data.refresh });
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (input: ResendVerificationInput) =>
      api.post(schoolAuthEndpoints.otpResend, resendVerificationResponseSchema, input),
  });
}
