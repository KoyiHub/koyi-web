import { z } from 'zod';

/**
 * School Admin auth responses — `frontend-integration.md` §4.1.
 *
 * Login has two possible outcomes and the backend decides which:
 *
 * - `otp_required: false` — the device is recognised, so a normal SimpleJWT
 *   pair comes back and the admin goes straight to the dashboard.
 * - `otp_required: true` — an OTP has to clear first, so NO tokens are
 *   issued. A challenge string comes back instead.
 *
 * Modelled as a discriminated union so the "verified" branch cannot be read
 * without tokens, and the "challenge" branch cannot accidentally be treated
 * as a completed sign-in.
 */
export const schoolAdminLoginResponseSchema = z.discriminatedUnion('otp_required', [
  z.object({
    otp_required: z.literal(false),
    access: z.string(),
    refresh: z.string(),
  }),
  z.object({
    otp_required: z.literal(true),
    challenge: z.string(),
  }),
]);

export type SchoolAdminLoginResponse = z.infer<typeof schoolAdminLoginResponseSchema>;

const schoolAdminUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string().optional(),
});

const schoolAdminSchoolSchema = z.object({
  id: z.string(),
  name: z.string(),
  abbreviation: z.string(),
});

/** Clearing the OTP is what actually issues the token pair. */
export const schoolAdminVerifyDeviceResponseSchema = z.object({
  access: z.string(),
  refresh: z.string(),
  user: schoolAdminUserSchema,
  school: schoolAdminSchoolSchema,
});

export type SchoolAdminVerifyDeviceResponse = z.infer<typeof schoolAdminVerifyDeviceResponseSchema>;
