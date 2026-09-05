import { z } from 'zod';

import {
  assessmentStatusSchema,
  assessmentSubjectSchema,
  assessmentTypeSchema,
  learningLevelSchema,
  paginatedSchema,
  performanceBandSchema,
} from '@/lib/api/contracts';

/**
 * Shapes shared across every School Admin resource.
 *
 * PROVISIONAL, like the endpoints — see `api/endpoints.ts`.
 */

/**
 * Band vocabulary and the list envelope are portal-neutral and live in
 * `@/lib/api/contracts`. They are re-exported here so every School Admin
 * module keeps importing from one place.
 *
 * @deprecated `performanceBandSchema`/`learningLevelSchema` are the
 * score-first vocabulary §9 rules out. Kept only for the modules that still
 * read the pre-guide `/v1/school/students/` shape (list/detail) — the real
 * FLN levels live on the dedicated `/fln/` endpoint
 * (`@/features/school-admin/students/api/fln.schema`).
 */
export {
  assessmentStatusSchema,
  assessmentSubjectSchema,
  assessmentTypeSchema,
  learningLevelSchema,
  paginatedSchema,
  performanceBandSchema,
};
export type {
  AssessmentStatus,
  AssessmentSubject,
  AssessmentType,
  LearningLevel,
  PaginatedResult,
  PerformanceBand,
} from '@/lib/api/contracts';

/** §4.3 — unpaginated reference data, ours (not the school's). */
export const gradeSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type Grade = z.infer<typeof gradeSchema>;

export const gradeListSchema = z.array(gradeSchema);

/** §4.3 — unpaginated reference data. Feeds the current-session picker in settings. */
export const sessionSchema = z.object({
  id: z.string(),
  start_year: z.number(),
  end_year: z.number(),
  label: z.string(),
});
export type Session = z.infer<typeof sessionSchema>;

export const sessionListSchema = z.array(sessionSchema);

const logoSchema = z.object({ id: z.string(), url: z.string(), type: z.string() }).nullable();

/**
 * §4.2 exactly — `{id, name, abbreviation, email, email_verified,
 * class_system, logo, current_session}`. `location`, `phone`, `address`,
 * `motto`, `current_term`, `term_starts_on`, `term_ends_on`, `timezone`
 * previously lived here as "harmless additions" with no doc anchor —
 * dropped in the contract-realignment pass, since none of them are
 * documented and the admin-identity fields they partly duplicated
 * (`/settings/account/`) had no anchor at all either and were removed
 * outright.
 */
export const schoolSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** 2–12 uppercase letters/digits. Read-only after registration — the form must say so. */
  abbreviation: z.string(),
  email: z.string(),
  email_verified: z.boolean().optional(),
  logo: logoSchema.optional(),
  class_system: z.enum(['primary', 'grade']),
  current_session: sessionSchema,
});
export type School = z.infer<typeof schoolSchema>;
