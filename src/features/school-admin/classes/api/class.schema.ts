import { z } from 'zod';

import { classTeacherSchema, paginatedSchema } from '@/features/school-admin/api/shared.schema';
import { studentListItemSchema } from '@/features/school-admin/students/api/student.schema';

/**
 * Classes. PROVISIONAL — see `@/features/school-admin/api/endpoints`.
 *
 * A class belongs to one grade and carries several teachers, exactly one of
 * whom is the form teacher. Grade and class name are modelled separately
 * (`Primary 3` + `Class A`) rather than as one free-text label, which is what
 * makes the Add Class form a grade select plus a name field.
 */

export const classListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  grade_id: z.string(),
  grade_name: z.string(),
  display_name: z.string(),
  term: z.string(),
  room: z.string().nullable(),
  capacity: z.number(),
  student_count: z.number(),
  average_score: z.number(),
  literacy_score: z.number(),
  numeracy_score: z.number(),
  teachers: z.array(classTeacherSchema),
});
export type ClassListItem = z.infer<typeof classListItemSchema>;

export const classListSchema = paginatedSchema(classListItemSchema);

export const classDetailSchema = classListItemSchema.extend({
  created_at: z.string(),
  students: z.array(studentListItemSchema),
});
export type ClassDetail = z.infer<typeof classDetailSchema>;
