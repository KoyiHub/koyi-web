import { z } from 'zod';

/**
 * School Admin settings — `frontend-integration.md` §4.2. Academic-calendar
 * settings (term dates, assessment window, an auto-baseline toggle) had no
 * guide anchor at all and were dropped; the real profile is just
 * `{name, logo, current_session}` plus the read-only `abbreviation`.
 */

/** Mirrors `apps.users.User` plus the security flags the screen shows. */
export const adminAccountSchema = z.object({
  id: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  full_name: z.string(),
  phone: z.string(),
  role: z.string(),
  email_verified: z.boolean(),
  two_factor_enabled: z.boolean(),
  last_login: z.string(),
  created_at: z.string(),
});
export type AdminAccount = z.infer<typeof adminAccountSchema>;

export const passwordChangeResponseSchema = z.object({
  detail: z.string(),
});
