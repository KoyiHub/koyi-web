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

export const schoolSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  logo_url: z.string().nullable(),
  motto: z.string(),
  class_system: z.enum(['primary', 'grade']),
  current_session: z.string(),
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
