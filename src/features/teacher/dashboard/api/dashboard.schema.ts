import { z } from 'zod';

import {
  assessmentSubjectSchema,
  paginatedSchema,
  performanceBandSchema,
} from '@/features/teacher/api/shared.schema';
import { domainSchema } from '@/lib/api/contracts';

/**
 * `GET /v1/teacher/dashboard/` — `frontend-integration.md` §5.1, matched
 * field-for-field. Five things about this endpoint are deliberately not how
 * the rest of the API behaves:
 *
 * - `class_distribution` is the ONE place literacy and numeracy collapse
 *   into a single band per child (their weaker domain) — a declared
 *   exception to §9, used nowhere else.
 * - `attention_count` is exactly `class_distribution.struggling`, not an
 *   independent number.
 * - There is no trend arrow — a mocked-up "12 ↑2%" was rejected rather than
 *   faked, since nothing here stores a historical snapshot to diff against.
 * - `insight` is a template over `students_needing_attention`, not a real
 *   recommendation engine; `group_id` is set only when one of the
 *   teacher's own groups already targets that exact skill, and is `null`
 *   far more often than not — hide "View Lesson Plan" rather than show a
 *   dead link when it is.
 * - `students_needing_attention` is capped at 5 and is NOT paginated — a
 *   dashboard preview, not the roster. The full list with filters is
 *   `/v1/teacher/assessments/{id}/analytics/roster/` (§5.5), scoped to one
 *   assessment.
 */
export const classDistributionSchema = z.object({
  strong: z.number(),
  intermediate: z.number(),
  struggling: z.number(),
  not_yet_assessed: z.number(),
});
export type ClassDistribution = z.infer<typeof classDistributionSchema>;

export const dashboardInsightSchema = z.object({
  domain: domainSchema,
  skill_name: z.string(),
  summary: z.string(),
  group_id: z.string().nullable(),
});
export type DashboardInsight = z.infer<typeof dashboardInsightSchema>;

export const attentionPreviewRowSchema = z.object({
  student_id: z.string(),
  full_name: z.string(),
  primary_gap: z.string(),
  last_assessed_at: z.string().nullable(),
});
export type AttentionPreviewRow = z.infer<typeof attentionPreviewRowSchema>;

export const dashboardSchema = z.object({
  teacher_name: z.string(),
  /** `null` — a teacher with no class assigned yet gets zeroes throughout, not a `404`. */
  school_class: z.string().nullable(),
  total_students: z.number(),
  assessed_students: z.number(),
  attention_count: z.number(),
  class_distribution: classDistributionSchema,
  insight: dashboardInsightSchema.nullable(),
  students_needing_attention: z.array(attentionPreviewRowSchema),
});
export type TeacherDashboard = z.infer<typeof dashboardSchema>;

/* -------------------------------------------------------------------------- */
/* Recent activity — no doc anchor (no teacher-scoped activity feed exists). */
/* Left exactly as built per an explicit scope decision — see               */
/* refactor-plan.md's contract-realignment writeup.                         */
/* -------------------------------------------------------------------------- */

export const activityTypeSchema = z.enum([
  'assessment_completed',
  'assessment_assigned',
  'student_flagged',
  'group_updated',
  'report_exported',
  'insight_generated',
]);
export type ActivityType = z.infer<typeof activityTypeSchema>;

export const activityItemSchema = z.object({
  id: z.string(),
  type: activityTypeSchema,
  title: z.string(),
  description: z.string(),
  /** ISO-8601. Rendered with `Intl`, never string-sliced. */
  occurred_at: z.string(),
  /** Day bucket the server assigned, so paging never splits a day inconsistently. */
  day_label: z.string(),
  student_id: z.string().nullable(),
  assessment_id: z.string().nullable(),
});
export type ActivityItem = z.infer<typeof activityItemSchema>;

export const activityListSchema = paginatedSchema(activityItemSchema);

/* -------------------------------------------------------------------------- */
/* AI insights — no doc anchor (only one `insight` object exists, embedded  */
/* in `/dashboard/`). Left exactly as built per the same scope decision.    */
/* -------------------------------------------------------------------------- */

export const insightKindSchema = z.enum([
  'emerging_gap',
  'common_mistake',
  'teaching_activity',
  'positive_trend',
]);
export type InsightKind = z.infer<typeof insightKindSchema>;

export const insightSchema = z.object({
  id: z.string(),
  kind: insightKindSchema,
  headline: z.string(),
  body: z.string(),
  /** Short server-authored label, e.g. "6 students" or "Primary 4 · Class A". */
  scope_label: z.string(),
  /** Bullet points the teacher can act on. Empty for narrative-only insights. */
  points: z.array(z.string()),
  /** The skill a focus group would be built around; `null` when not applicable. */
  focus_skill: z.string().nullable(),
  student_ids: z.array(z.string()),
  generated_at: z.string(),
});
export type Insight = z.infer<typeof insightSchema>;

export const insightsSchema = z.object({
  generated_label: z.string(),
  insights: z.array(insightSchema),
});
export type Insights = z.infer<typeof insightsSchema>;

/* -------------------------------------------------------------------------- */
/* Class performance — no doc anchor (the per-skill grid is                 */
/* `analytics.skill_matrix`, scoped to one assessment). Left exactly as     */
/* built per the same scope decision.                                       */
/* -------------------------------------------------------------------------- */

/** One skill's class-wide average, with the movement since the previous assessment. */
export const skillPerformanceSchema = z.object({
  id: z.string(),
  skill: z.string(),
  subject: assessmentSubjectSchema,
  average_score: z.number(),
  /** Percentage points since the last comparable assessment; negative means a drop. */
  change: z.number(),
  students_below_benchmark: z.number(),
});
export type SkillPerformance = z.infer<typeof skillPerformanceSchema>;

/** A point on the class trend line: one completed assessment. */
export const trendPointSchema = z.object({
  id: z.string(),
  label: z.string(),
  average_score: z.number(),
  participation_rate: z.number(),
  completed_on: z.string(),
});
export type TrendPoint = z.infer<typeof trendPointSchema>;

/** How many children moved band since the baseline. The story a term is judged on. */
export const bandMovementSchema = z.object({
  band: performanceBandSchema,
  label: z.string(),
  students: z.number(),
  percentage: z.number(),
  /** Net change in headcount since the baseline assessment. */
  change: z.number(),
});
export type BandMovement = z.infer<typeof bandMovementSchema>;

export const classPerformanceSchema = z.object({
  class_name: z.string(),
  term_label: z.string(),
  assessed_count: z.number(),
  total_students: z.number(),
  class_average: z.number(),
  class_average_change: z.number(),
  participation_rate: z.number(),
  baseline_label: z.string(),
  movement: z.array(bandMovementSchema),
  skills: z.array(skillPerformanceSchema),
  trend: z.array(trendPointSchema),
  /** Children who moved up a band since baseline — the counterpart to the attention list. */
  most_improved: z.array(
    z.object({
      student_id: z.string(),
      full_name: z.string(),
      from_band: performanceBandSchema,
      to_band: performanceBandSchema,
      change: z.number(),
    }),
  ),
});
export type ClassPerformance = z.infer<typeof classPerformanceSchema>;
