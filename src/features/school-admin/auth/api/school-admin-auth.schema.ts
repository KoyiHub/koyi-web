import { z } from 'zod';

/**
 * School Admin auth responses. PROVISIONAL — see `endpoints.ts`.
 *
 * Login has two possible outcomes and the backend decides which:
 *
 * - `verification_required: false` — the device is recognised, so a normal
 *   SimpleJWT pair comes back and the admin goes straight to the dashboard.
 * - `verification_required: true` — the device or cookie is not recognised,
 *   so NO tokens are issued. A challenge id and the masked destination come
 *   back instead, and the admin must clear a one-time code first.
 *
 * Modelled as a discriminated union so the "verified" branch cannot be read
 * without tokens, and the "challenge" branch cannot accidentally be treated
 * as a completed sign-in.
 */
export const schoolAdminLoginResponseSchema = z.discriminatedUnion('verification_required', [
  z.object({
    verification_required: z.literal(false),
    access: z.string(),
    refresh: z.string(),
  }),
  z.object({
    verification_required: z.literal(true),
    challenge_id: z.string(),
    /** Where the code was sent, already masked by the backend for display. */
    email: z.string(),
  }),
]);

export type SchoolAdminLoginResponse = z.infer<typeof schoolAdminLoginResponseSchema>;

/** Clearing the device challenge is what actually issues the token pair. */
export const schoolAdminVerifyDeviceResponseSchema = z.object({
  access: z.string(),
  refresh: z.string(),
});

export type SchoolAdminVerifyDeviceResponse = z.infer<typeof schoolAdminVerifyDeviceResponseSchema>;
