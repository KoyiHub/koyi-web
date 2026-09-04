import { z } from 'zod';

import { paginatedSchema } from '@/features/teacher/api/shared.schema';

/**
 * The teacher's own class roster — `GET /v1/teacher/students/`, §5.6.
 *
 * A slimmer shape than the school portal's `StudentSerializer` (§4.5):
 * `school_class` is a plain string here, not a nested object, and there is
 * no guardian information or timestamps. A teacher manages a lesson, not
 * the enrolment record — levels, scores and gaps live on `/skills/` (per
 * child) and `/analytics/roster/` (per assessment), not embedded here.
 */
export const studentRowSchema = z.object({
  id: z.string(),
  student_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  full_name: z.string(),
  date_of_birth: z.string(),
  gender: z.enum(['female', 'male']),
  school_class: z.string(),
});
export type StudentRow = z.infer<typeof studentRowSchema>;

export const studentListSchema = paginatedSchema(studentRowSchema);
export type StudentList = z.infer<typeof studentListSchema>;
