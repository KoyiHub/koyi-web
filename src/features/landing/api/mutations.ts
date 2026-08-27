import { useMutation } from '@tanstack/react-query';

import { schoolOnboardingEndpoints } from '@/features/landing/api/endpoints';
import {
  registerSchoolResponseSchema,
  resendVerificationResponseSchema,
  verifyEmailResponseSchema,
} from '@/features/landing/api/school-onboarding.schema';
import { api } from '@/lib/api/client';

export interface RegisterSchoolInput {
  schoolName: string;
  schoolEmail: string;
  password: string;
  classSystem: 'grade' | 'primary';
  currentSession: string;
  /**
   * The logo file is held in the browser and uploaded after the account
   * exists — a multipart upload endpoint has not been confirmed, so only the
   * filename travels with registration for now.
   */
  logoFileName?: string | undefined;
}

export interface VerifyEmailInput {
  schoolId: string;
  code: string;
}

export interface ResendVerificationInput {
  schoolId: string;
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
      api.post(schoolOnboardingEndpoints.register, registerSchoolResponseSchema, input),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (input: VerifyEmailInput) =>
      api.post(schoolOnboardingEndpoints.verifyEmail, verifyEmailResponseSchema, input),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (input: ResendVerificationInput) =>
      api.post(
        schoolOnboardingEndpoints.resendVerification,
        resendVerificationResponseSchema,
        input,
      ),
  });
}
