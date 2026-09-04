import { z } from 'zod';

/**
 * School registration — `frontend-integration.md` §4.1. Registering does
 * **not** sign the school in; verifying the email is what issues tokens.
 */
export const registerSchoolResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  otp_sent: z.boolean(),
});
export type RegisterSchoolResponse = z.infer<typeof registerSchoolResponseSchema>;

export const verifiedSchoolSchema = z.object({
  id: z.string(),
  name: z.string(),
  abbreviation: z.string(),
  email: z.string(),
});

export const verifyEmailResponseSchema = z.object({
  access: z.string(),
  refresh: z.string(),
  school: verifiedSchoolSchema,
});
export type VerifyEmailResponse = z.infer<typeof verifyEmailResponseSchema>;

/**
 * Resending the registration code has no documented endpoint in the guide —
 * `/v1/school/auth/otp/resend/` predates it and is kept as this client's
 * best guess, not confirmed contract, since every OTP flow needs some way
 * to ask for a new code.
 */
export const resendVerificationResponseSchema = z.object({
  retry_after_seconds: z.number(),
});
export type ResendVerificationResponse = z.infer<typeof resendVerificationResponseSchema>;
