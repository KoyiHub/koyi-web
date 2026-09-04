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

export const gradeSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number(),
});
export type Grade = z.infer<typeof gradeSchema>;

export const gradeListSchema = z.object({
  count: z.number(),
  results: z.array(gradeSchema),
});

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
 * §4.2's real profile is `{name, logo, current_session}` plus the read-only
 * `abbreviation`. Phone/address/location/motto/timezone/current_term/term
 * dates have no guide backing — kept as additional fields a real profile
 * serializer could plausibly also carry, since nothing about them conflicts
 * with the contract; only `academic settings` (assessment windows, an
 * auto-baseline toggle) was dropped outright for having no anchor at all.
 */
export const schoolSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** 2–12 uppercase letters/digits. Read-only after registration — the form must say so. */
  abbreviation: z.string(),
  location: z.string(),
  email: z.string(),
  email_verified: z.boolean().optional(),
  phone: z.string(),
  address: z.string(),
  logo: logoSchema.optional(),
  logo_url: z.string().nullable().optional(),
  motto: z.string(),
  class_system: z.enum(['primary', 'grade']),
  current_session: sessionSchema,
  current_term: z.string(),
  term_starts_on: z.string(),
  term_ends_on: z.string(),
  timezone: z.string(),
});
export type School = z.infer<typeof schoolSchema>;

/** Teacher summary as embedded in a class payload. */
export const classTeacherSchema = z.object({
  id: z.string(),
  teacher_id: z.string(),
  full_name: z.string(),
  email: z.string(),
  is_form_teacher: z.boolean(),
});
export type ClassTeacher = z.infer<typeof classTeacherSchema>;
