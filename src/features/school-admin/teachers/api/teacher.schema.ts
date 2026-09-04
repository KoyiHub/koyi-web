import { z } from 'zod';

import { paginatedSchema } from '@/features/school-admin/api/shared.schema';
import { classSchema } from '@/features/school-admin/classes/api/class.schema';

/**
 * Teacher records — `frontend-integration.md` §4.4. One shape for both the
 * list and the detail — the guide shows a single flat object, not a
 * summary/detail split. `is_active` (not a `status` enum) is the real
 * lifecycle field, toggled by disable/enable; a teacher has exactly one
 * `school_class`, not several — `Teacher.school_class` is a single field
 * per §5.6's own confirmation, not a list.
 */
export const teacherSchema = z.object({
  id: z.string(),
  teacher_id: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  full_name: z.string(),
  school_class: classSchema.nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Teacher = z.infer<typeof teacherSchema>;

export const teacherListSchema = paginatedSchema(teacherSchema);

/**
 * `POST .../password-reset/` — "Email them a reset" (§4.4). No password or
 * mode ever reaches the admin's screen; the server just confirms an email
 * went out.
 */
export const teacherPasswordResetSchema = z.object({
  sent: z.boolean(),
});
export type TeacherPasswordReset = z.infer<typeof teacherPasswordResetSchema>;

/** `POST .../delete/request/` — sends a 2FA code before a teacher account can be removed. */
export const deleteRequestSchema = z.object({ sent: z.boolean() });
