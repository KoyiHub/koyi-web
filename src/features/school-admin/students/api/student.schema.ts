import { z } from 'zod';

import { paginatedSchema } from '@/features/school-admin/api/shared.schema';
import { classSchema } from '@/features/school-admin/classes/api/class.schema';

/**
 * Student records — `frontend-integration.md` §4.5. `student_id` is
 * server-generated and never accepted as input (see `add-student-page.tsx`);
 * levels, scores and assessment history live on the dedicated `/fln/`
 * endpoint (`fln.schema.ts`), not embedded here. Guardian fields are flat on
 * the student object, not nested, and `guardian_phone_number` is the field
 * name the guide uses (not `guardian_phone`).
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

/**
 * `is_active` — §4.5 requires *some* status field (disable/enable exist,
 * and "an active student always has a class; only a disabled one may sit
 * outside the structure"), but the doc's own example JSON doesn't show one
 * explicitly. Assumed to match the teacher shape's confirmed `is_active`
 * boolean (§4.4) — the least invented choice available, not a guessed name.
 */
export const studentSchema = z.object({
  id: z.string(),
  student_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  full_name: z.string(),
  date_of_birth: z.string(),
  gender: z.enum(STUDENT_GENDERS),
  school_class: classSchema.nullable(),
  guardian_name: z.string(),
  guardian_phone_number: z.string(),
  /** Optional — many guardians won't have one. Where an assessment link is sent. */
  guardian_email: z.string().nullable(),
  guardian_relationship: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Student = z.infer<typeof studentSchema>;

export const studentListSchema = paginatedSchema(studentSchema);
