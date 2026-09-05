import { z } from 'zod';

/**
 * School admin password reset — `frontend-integration.md` §4.1. Three
 * steps, OTP-code based (distinct from the teacher flow, which emails a
 * link — see `@/features/auth/api/password-reset.schema.ts`).
 *
 * The request step always returns `200` whether or not the address is
 * registered, so the form can never be used to discover which schools have
 * accounts — say "if that address is registered, a code is on its way,"
 * never "code sent."
 */
export const requestPasswordResetResponseSchema = z.unknown();

export const verifyPasswordResetResponseSchema = z.object({
  reset_token: z.string(),
});
export type VerifyPasswordResetResponse = z.infer<typeof verifyPasswordResetResponseSchema>;

export const confirmPasswordResetResponseSchema = z.unknown();
