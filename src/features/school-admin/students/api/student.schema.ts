import { z } from 'zod';

import { paginatedSchema } from '@/features/school-admin/api/shared.schema';

/**
 * Student records — `frontend-integration.md` §4.5. `student_id` is
 * server-generated and never accepted as input (see `add-student-page.tsx`);
 * levels, scores and assessment history live on the dedicated `/fln/`
 * endpoint (`fln.schema.ts`), not embedded here — the old
 * `level`/`domain_scores`/`strengths`/`learning_gaps`/`assessments` block
 * this replaces was score-first vocabulary §9 rules out.
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

export const studentStatusSchema = z.enum(['active', 'disabled']);
export type StudentStatus = z.infer<typeof studentStatusSchema>;

export const studentListItemSchema = z.object({
  id: z.string(),
  student_id: z.string(),
  full_name: z.string(),
  age: z.number(),
  class_name: z.string(),
  grade_name: z.string(),
  status: studentStatusSchema,
});
export type StudentListItem = z.infer<typeof studentListItemSchema>;

export const studentListSchema = paginatedSchema(studentListItemSchema);

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
    /** Optional — many guardians won't have one. Where an assessment link is sent. */
    email: z.string().nullable(),
    relationship: z.string(),
  }),
});
export type StudentDetail = z.infer<typeof studentDetailSchema>;
