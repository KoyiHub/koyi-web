import { z } from 'zod';

import { assignmentStatusSchema, flnLevelSchema } from '@/lib/api/contracts';

/**
 * `GET /v1/school/students/{id}/fln/` — `frontend-integration.md` §4.5. The
 * school-level view: levels and scores, not the full diagnostic breakdown,
 * which is the teacher's own view (`@/features/teacher/students`).
 */
export const recentResultSchema = z.object({
  assessment: z.string(),
  date: z.string(),
  percentage: z.string(),
  status: assignmentStatusSchema,
});
export type RecentResult = z.infer<typeof recentResultSchema>;

export const studentFlnSchema = z.object({
  student: z.object({
    id: z.string(),
    full_name: z.string(),
    student_id: z.string(),
  }),
  literacy_level: flnLevelSchema,
  numeracy_level: flnLevelSchema,
  last_assessed_at: z.string().nullable(),
  recent_results: z.array(recentResultSchema),
});
export type StudentFln = z.infer<typeof studentFlnSchema>;
