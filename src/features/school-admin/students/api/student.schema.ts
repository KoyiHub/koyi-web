import { z } from 'zod';

import {
  assessmentSubjectSchema,
  assessmentTypeSchema,
  learningLevelSchema,
  paginatedSchema,
  performanceBandSchema,
} from '@/features/school-admin/api/shared.schema';

/**
 * Student records and their assessment history. PROVISIONAL — see
 * `@/features/school-admin/api/endpoints`.
 */

/**
 * Guardian relationships the enrolment form offers. Mirrors the choices the
 * backend accepts for `guardian_relationship`.
 */
export const GUARDIAN_RELATIONSHIPS = [
  'Mother',
  'Father',
  'Guardian',
  'Aunt',
  'Uncle',
  'Grandparent',
  'Sibling',
] as const;

/** Genders the enrolment form offers. */
export const STUDENT_GENDERS = ['female', 'male'] as const;

export const studentListItemSchema = z.object({
  id: z.string(),
  student_id: z.string(),
  full_name: z.string(),
  age: z.number(),
  class_name: z.string(),
  grade_name: z.string(),
  level: learningLevelSchema,
});
export type StudentListItem = z.infer<typeof studentListItemSchema>;

export const studentListSchema = paginatedSchema(studentListItemSchema);

/** One FLN domain result within a sitting. The band comes from the server. */
export const domainScoreSchema = z.object({
  key: z.string(),
  label: z.string(),
  score: z.number(),
  band: performanceBandSchema,
});
export type DomainScore = z.infer<typeof domainScoreSchema>;

export const studentAssessmentSchema = z.object({
  id: z.string(),
  assessment_id: z.string(),
  title: z.string(),
  subject: assessmentSubjectSchema,
  assessment_type: assessmentTypeSchema,
  taken_on: z.string(),
  score: z.number(),
  band: performanceBandSchema,
  administered_by: z.string(),
});
export type StudentAssessment = z.infer<typeof studentAssessmentSchema>;

export const studentDetailSchema = studentListItemSchema.extend({
  first_name: z.string(),
  last_name: z.string(),
  date_of_birth: z.string(),
  gender: z.enum(STUDENT_GENDERS),
  class_id: z.string(),
  enrolled_on: z.string(),
  guardian: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }),
  /** `null` for a newly enrolled student who has not sat anything yet. */
  latest_assessment: z
    .object({
      taken_on: z.string(),
      domain_scores: z.array(domainScoreSchema),
    })
    .nullable(),
  strengths: z.array(z.string()),
  learning_gaps: z.array(z.string()),
  assessments: z.array(studentAssessmentSchema),
});
export type StudentDetail = z.infer<typeof studentDetailSchema>;
