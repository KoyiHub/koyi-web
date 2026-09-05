import { z } from 'zod';

/**
 * Classes — `frontend-integration.md` §4.3. **Unpaginated** — a bare array,
 * both from the list and from `POST`'s `201`.
 *
 * A class belongs to one grade and carries its own arm name (`Primary 3` +
 * `Class A`), which is what makes the Add Class form a grade select plus a
 * name field. There is no class detail endpoint — `grade` holds the grade's
 * uuid (the field the guide's `POST` body uses, not `grade_id`).
 */
export const classSchema = z.object({
  id: z.string(),
  grade: z.string(),
  grade_name: z.string(),
  name: z.string(),
  label: z.string(),
});
export type SchoolClass = z.infer<typeof classSchema>;

export const classListSchema = z.array(classSchema);
