import { z } from 'zod';

import { assessmentStatusSchema, paginatedSchema } from '@/lib/api/contracts';

/**
 * `GET /v1/school/assessments/` — `frontend-integration.md` §4.8. Every
 * assessment across every teacher, for oversight — school management does
 * not author papers itself, that stays a teacher's job. `assigned_count`
 * and `graded_count` are cheap counts, not a full analytics build; the
 * teacher-side analytics endpoint is what a per-paper drill-down would use.
 */
export const schoolAssessmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** `null` once the authoring teacher has been removed — the row survives. */
  teacher_name: z.string().nullable(),
  code: z.string(),
  status: assessmentStatusSchema,
  opens_at: z.string().nullable(),
  closes_at: z.string().nullable(),
  assigned_count: z.number(),
  graded_count: z.number(),
  created_at: z.string(),
});
export type SchoolAssessment = z.infer<typeof schoolAssessmentSchema>;

export const schoolAssessmentListSchema = paginatedSchema(schoolAssessmentSchema);
