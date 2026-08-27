import { z } from 'zod';

/** Response contracts for the provisional school-onboarding endpoints. */
export const registerSchoolResponseSchema = z.object({
  schoolId: z.string(),
  schoolName: z.string(),
  schoolEmail: z.string(),
  /** True while the email still has to be confirmed with a code. */
  verificationRequired: z.boolean(),
});

export type RegisterSchoolResponse = z.infer<typeof registerSchoolResponseSchema>;

export const verifyEmailResponseSchema = z.object({
  schoolId: z.string(),
  verified: z.boolean(),
});

export type VerifyEmailResponse = z.infer<typeof verifyEmailResponseSchema>;

export const resendVerificationResponseSchema = z.object({
  schoolEmail: z.string(),
  /** Seconds the caller should wait before another resend is accepted. */
  retryAfterSeconds: z.number(),
});

export type ResendVerificationResponse = z.infer<typeof resendVerificationResponseSchema>;
