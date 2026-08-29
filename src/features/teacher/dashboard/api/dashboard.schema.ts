import { z } from 'zod';

import {
  assessmentSubjectSchema,
  paginatedSchema,
  performanceBandSchema,
} from '@/features/teacher/api/shared.schema';

/**
 * PROVISIONAL Teacher dashboard contracts — see `../../api/endpoints.ts`.
 *
 * Every band, label and percentage below is read straight off the response.
 * Nothing here is derived in the browser, because the score-to-band mapping is
 * a scoring rule that belongs to the backend.
 */

/** A headline figure on the dashboard, with its own movement caption. */
const statSchema = z.object({
  value: z.number(),
  /** Server-authored caption, e.g. "+4 this week". `null` when there is nothing to say. */
  delta_label: z.string().nullable(),
  /** Drives the caption colour without the client interpreting the wording. */
  delta_direction: z.enum(['up', 'down', 'flat']),
});
export type DashboardStat = z.infer<typeof statSchema>;

/** One band's slice of the class. */
export const distributionSegmentSchema = z.object({
  band: performanceBandSchema,
  label: z.string(),
  students: z.number(),
  percentage: z.number(),
});
export type DistributionSegment = z.infer<typeof distributionSegmentSchema>;

export const attentionPrioritySchema = z.enum(['high', 'medium', 'low']);
export type AttentionPriority = z.infer<typeof attentionPrioritySchema>;

/** A child the class dashboard is flagging, with the action the server suggests. */
export const attentionRowSchema = z.object({
  student_id: z.string(),
  full_name: z.string(),
  student_code: z.string(),
  priority: attentionPrioritySchema,
  identified_issue: z.string(),
  subject: assessmentSubjectSchema,
  last_assessment: z.string(),
  last_assessment_label: z.string(),
  recommended_action: z.string(),
});
export type AttentionRow = z.infer<typeof attentionRowSchema>;

export const dashboardSchema = z.object({
  class_name: z.string(),
  term_label: z.string(),
  /** The server owns the clock, so the greeting never disagrees with the report data. */
  time_of_day: z.enum(['morning', 'afternoon', 'evening']),
  stats: z.object({
    total_students: statSchema,
    assessed: statSchema,
    needs_attention: statSchema,
  }),
  distribution: z.object({
    assessed_count: z.number(),
    updated_label: z.string(),
    segments: z.array(distributionSegmentSchema),
  }),
  ai_insight: z.object({
    id: z.string(),
    headline: z.string(),
    body: z.string(),
    focus_skill: z.string(),
    affected_students: z.number(),
  }),
  attention: z.object({
    total: z.number(),
    rows: z.array(attentionRowSchema),
  }),
});
export type TeacherDashboard = z.infer<typeof dashboardSchema>;

/* -------------------------------------------------------------------------- */
/* Recent activity                                                            */
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
/* Students needing attention                                                 */
/* -------------------------------------------------------------------------- */

export const attentionListSchema = paginatedSchema(attentionRowSchema).extend({
  priority_counts: z.object({
    high: z.number(),
    medium: z.number(),
    low: z.number(),
  }),
});
export type AttentionList = z.infer<typeof attentionListSchema>;

/* -------------------------------------------------------------------------- */
/* AI insights                                                                */
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
/* Class performance                                                          */
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
