import { z } from 'zod';

import { paginatedSchema, studentSummarySchema } from '@/features/teacher/api/shared.schema';

/**
 * The student directory list — `GET /v1/teacher/students/`.
 *
 * PROVISIONAL: `frontend-integration.md` §5.6 documents this endpoint as
 * *Planned* with a one-line description ("Students in the teacher's
 * classes") and no JSON — this file's shape predates the guide and still
 * carries the pre-refactor score-first vocabulary (`level`, `latest_score`).
 * Left as-is deliberately: rewriting it on a guess is its own phase, not a
 * side effect of rebuilding the profile/skills screen (`skills.schema.ts`),
 * which the guide *does* fully specify. See `refactor-plan.md`'s Phase 4
 * writeup.
 */
export const studentRowSchema = studentSummarySchema.extend({
  level_label: z.string(),
  /** Latest overall percentage, or `null` for a child with no completed assessment. */
  latest_score: z.number().nullable(),
  last_assessed: z.string().nullable(),
  last_assessed_label: z.string(),
  /** Short server-authored summary of the child's biggest gap, or `null`. */
  primary_gap: z.string().nullable(),
  needs_attention: z.boolean(),
});
export type StudentRow = z.infer<typeof studentRowSchema>;

export const studentListSchema = paginatedSchema(studentRowSchema).extend({
  level_counts: z.object({
    all: z.number(),
    strong: z.number(),
    intermediate: z.number(),
    struggling: z.number(),
    beginner: z.number(),
  }),
});
export type StudentList = z.infer<typeof studentListSchema>;
