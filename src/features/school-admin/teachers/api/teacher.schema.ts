import { z } from 'zod';

import {
  assessmentStatusSchema,
  assessmentSubjectSchema,
  assessmentTypeSchema,
  paginatedSchema,
} from '@/features/school-admin/api/shared.schema';

/**
 * Teacher records and the assessments they author. PROVISIONAL — see
 * `@/features/school-admin/api/endpoints`.
 */

export const teacherStatusSchema = z.enum(['active', 'invited', 'suspended']);
export type TeacherStatus = z.infer<typeof teacherStatusSchema>;

export const teacherListItemSchema = z.object({
  id: z.string(),
  teacher_id: z.string(),
  full_name: z.string(),
  email: z.string(),
  status: teacherStatusSchema,
  /** Form class, or the first class assigned. `null` for a teacher not yet placed. */
  class_assigned: z.string().nullable(),
  /** How many further classes this teacher covers, for a "+2" affordance. */
  additional_class_count: z.number(),
});
export type TeacherListItem = z.infer<typeof teacherListItemSchema>;

export const teacherListSchema = paginatedSchema(teacherListItemSchema);

const teacherClassSchema = z.object({
  class_id: z.string(),
  class_name: z.string(),
  grade_name: z.string(),
  is_form_teacher: z.boolean(),
  student_count: z.number(),
});
export type TeacherClass = z.infer<typeof teacherClassSchema>;

/**
 * An assessment authored by a teacher.
 *
 * The Django `Assessment` model does not exist yet, so this mirrors the shape
 * the assessment flows in this repo already imply — a titled, subject-scoped,
 * timed set of questions targeted at a class, with a lifecycle status and
 * completion counts. Answer keys and scoring rules are deliberately absent:
 * they must never reach the browser.
 */
export const teacherAssessmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  subject: assessmentSubjectSchema,
  assessment_type: assessmentTypeSchema,
  grade_name: z.string(),
  class_name: z.string(),
  question_count: z.number(),
  duration_minutes: z.number(),
  status: assessmentStatusSchema,
  created_at: z.string(),
  scheduled_for: z.string().nullable(),
  students_assigned: z.number(),
  students_completed: z.number(),
  average_score: z.number().nullable(),
});
export type TeacherAssessment = z.infer<typeof teacherAssessmentSchema>;

export const teacherDetailSchema = teacherListItemSchema.extend({
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string(),
  qualification: z.string(),
  subjects: z.array(z.string()),
  date_joined: z.string(),
  last_login: z.string().nullable(),
  classes: z.array(teacherClassSchema),
  stats: z.object({
    assessments_created: z.number(),
    classes_assigned: z.number(),
    students_reached: z.number(),
    average_class_score: z.number().nullable(),
  }),
  assessments: z.array(teacherAssessmentSchema),
});
export type TeacherDetail = z.infer<typeof teacherDetailSchema>;

/**
 * Response to a password reset.
 *
 * `temporary_password` is populated only when the admin asked the server to
 * generate one — a password the admin typed themselves is never echoed back.
 */
export const teacherPasswordResetSchema = z.object({
  mode: z.enum(['generate', 'manual']),
  temporary_password: z.string().nullable(),
  must_change_on_next_login: z.boolean(),
  updated_at: z.string(),
});
export type TeacherPasswordReset = z.infer<typeof teacherPasswordResetSchema>;
