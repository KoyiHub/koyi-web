import { z } from 'zod';

/**
 * School Admin settings. PROVISIONAL — see
 * `@/features/school-admin/api/endpoints`.
 *
 * Three areas, matching what a school administrator actually controls:
 * the school's own record, the academic calendar the rest of the app reads
 * terms and grades from, and their own account and security.
 */

export const academicSettingsSchema = z.object({
  current_session: z.string(),
  current_term: z.string(),
  /** `YYYY-MM-DD` — bound directly to a date input. */
  term_starts_on: z.string(),
  term_ends_on: z.string(),
  class_system: z.enum(['primary', 'grade']),
  grade_levels: z.array(z.string()),
  assessment_window_weeks: z.number(),
  auto_assign_baseline: z.boolean(),
});
export type AcademicSettings = z.infer<typeof academicSettingsSchema>;

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
