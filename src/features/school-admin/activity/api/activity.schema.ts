import { z } from 'zod';

/** `{ id, name }` or `null` — every related object in a row shares this shape. */
const activityRefSchema = z.object({ id: z.string(), name: z.string() }).nullable();

/**
 * One activity row — `frontend-integration.md` §4.6. `label`/`description`
 * are written server-side to be shown as-is; never reconstruct them from the
 * referenced ids, since the wording is designed to survive a renamed or
 * deleted row.
 */
export const activityRowSchema = z.object({
  id: z.string(),
  action: z.string(),
  label: z.string(),
  description: z.string(),
  teacher: activityRefSchema,
  student: activityRefSchema,
  school_class: activityRefSchema,
  assessment: activityRefSchema,
  metadata: z.record(z.string(), z.unknown()),
  occurred_at: z.string(),
});
export type ActivityRow = z.infer<typeof activityRowSchema>;

/**
 * Cursor-paginated, not page-numbered — rows land while someone is reading,
 * so an offset could skip or repeat one. No `count`; follow `next` verbatim.
 */
export const activityFeedSchema = z.object({
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(activityRowSchema),
});
