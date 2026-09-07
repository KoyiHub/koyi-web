import { z } from 'zod';

import { paginatedSchema } from '@/features/teacher/api/shared.schema';
import { domainSchema, flnLevelSchema } from '@/lib/api/contracts';

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
  // Loosened from the strict `literacy`/`numeracy` enum: the live backend
  // has been observed sending a `domain` that is neither of those two
  // values nor `null`, despite the doc's own example always showing a
  // concrete domain. Rather than guess at the real value (a third domain
  // name? different casing? a category label?), this accepts whatever
  // arrives and the UI only renders the domain/skill line when it happens
  // to be exactly `literacy` or `numeracy` — anything else degrades to
  // "no domain line" instead of a crash.
  domain: z.string().nullable(),
  skill_name: z.string().nullable(),
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
/* `analytics.skill_matrix`, scoped to one assessment). Left as known-fake   */
/* per the original scope decision, but rebuilt level-first (Phase 7's §9   */
/* sweep): the pre-refactor shape modelled a bare class-average percentage, */
/* strong/intermediate/struggling bands and a raw score trend line — all    */
/* forbidden. This mirrors the same level-distribution + movement          */
/* vocabulary already used by the real school overview and student skills  */
/* endpoints, with literacy and numeracy always kept independent.          */
/* -------------------------------------------------------------------------- */

/** Every level keyed 1–5, even at zero, per domain. */
export const classLevelDistributionSchema = z.object({
  levels: z.object({
    literacy: z.record(z.string(), z.number()),
    numeracy: z.record(z.string(), z.number()),
  }),
  /** Children with no result yet in that domain — not folded into level 1. */
  unplaced: z.object({ literacy: z.number(), numeracy: z.number() }),
});
export type ClassLevelDistribution = z.infer<typeof classLevelDistributionSchema>;

/** How many children moved, per domain, since the last check — a headcount, never a percentage. */
export const classMovementSchema = z.object({
  domain: domainSchema,
  moved_up: z.number(),
  moved_down: z.number(),
  unchanged: z.number(),
  newly_placed: z.number(),
});
export type ClassMovement = z.infer<typeof classMovementSchema>;

/** One skill's level spread across the class — a grid, never an average score. */
export const skillPerformanceSchema = z.object({
  id: z.string(),
  skill: z.string(),
  domain: domainSchema,
  levels: z.record(z.string(), z.number()),
  /** At the skill's own lowest probed level — the children it would teach next. */
  students_needing_support: z.number(),
});
export type SkillPerformance = z.infer<typeof skillPerformanceSchema>;

export const classPerformanceSchema = z.object({
  class_name: z.string(),
  /** e.g. "since the last assessment" — no term or date-window framing. */
  measured_since: z.string(),
  assessed_count: z.number(),
  total_students: z.number(),
  level_distribution: classLevelDistributionSchema,
  movement: z.array(classMovementSchema),
  skills: z.array(skillPerformanceSchema),
  /** Children who moved up a level since the last check — the counterpart to the attention list. */
  most_improved: z.array(
    z.object({
      student_id: z.string(),
      full_name: z.string(),
      domain: domainSchema,
      previous: flnLevelSchema.nullable(),
      current: flnLevelSchema,
    }),
  ),
});
export type ClassPerformance = z.infer<typeof classPerformanceSchema>;
