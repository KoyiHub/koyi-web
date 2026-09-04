import { z } from 'zod';

import {
  assignmentStatusSchema,
  domainSchema,
  flnLevelSchema,
  markingStatusSchema,
  narrativeSchema,
  questionContentTypeSchema,
  questionLayoutSchema,
  questionTypeSchema,
} from '@/lib/api/contracts';

/**
 * Results, analytics and review — `frontend-integration.md` §5.5.
 *
 * Placement runs automatically when a child submits their last section, and
 * runs in **two passes**: choice/number items mark instantly, text/audio go
 * to the AI marker afterwards and the child is placed again when it lands.
 * `marking_status` and `warnings` are carried on every shape figures appear
 * in for that reason (A.2) — never assume a screen opened after marking
 * finished.
 *
 * SECURITY BOUNDARY: only `studentResponsesSchema` carries `is_correct` — to
 * a teacher, after the fact, with `was_selected` alongside it so green/red
 * needs no cross-referencing. Nothing else here does.
 */

/**
 * One row of the results table — `GET .../results/`. The guide gives only
 * "Every student: progress, score, level", no JSON. This is this client's
 * shape, not confirmed contract; flag it if the real endpoint differs.
 */
export const resultsRowSchema = z.object({
  student_id: z.string(),
  full_name: z.string(),
  school_class: z.string(),
  status: assignmentStatusSchema,
  /** Decimal string like the rest of the API's percentages. `null` before submission. */
  percentage: z.string().nullable(),
  literacy_level: flnLevelSchema.nullable(),
  numeracy_level: flnLevelSchema.nullable(),
});
export type ResultsRow = z.infer<typeof resultsRowSchema>;
export const resultsListSchema = z.array(resultsRowSchema);

/** Every level keyed 1–5, even at zero — a chart that drops empty levels reads narrower than the class actually is. */
export const levelDistributionSchema = z.object({
  literacy: z.record(z.string(), z.number()),
  numeracy: z.record(z.string(), z.number()),
});
export type LevelDistribution = z.infer<typeof levelDistributionSchema>;

export const skillMatrixEntrySchema = z.object({
  skill_name: z.string(),
  domain: domainSchema,
  levels: z.record(z.string(), z.object({ passed: z.number(), total: z.number() })),
});
export type SkillMatrixEntry = z.infer<typeof skillMatrixEntrySchema>;

/** By subskill at a level — "Simple inference at Level 3" is teachable, "Q12" is not. */
export const mostMissedEntrySchema = z.object({
  subskill_name: z.string(),
  fln_level: flnLevelSchema,
  failed_pct: z.number(),
});
export type MostMissedEntry = z.infer<typeof mostMissedEntrySchema>;

export const analyticsSchema = z.object({
  marking_status: markingStatusSchema,
  level_distribution: levelDistributionSchema,
  participation: z.object({ assigned: z.number(), submitted: z.number() }),
  skill_matrix: z.array(skillMatrixEntrySchema),
  most_missed: z.array(mostMissedEntrySchema),
  average_percentage: z.string(),
  warnings: z.array(z.string()),
  narrative: narrativeSchema,
});
export type Analytics = z.infer<typeof analyticsSchema>;

/** Who needs help — filterable by domain/level on the real endpoint. */
export const analyticsRosterRowSchema = z.object({
  student_id: z.string(),
  full_name: z.string(),
  school_class: z.string(),
  literacy_level: flnLevelSchema.nullable(),
  numeracy_level: flnLevelSchema.nullable(),
  weak_subskills: z.array(z.string()),
});
export type AnalyticsRosterRow = z.infer<typeof analyticsRosterRowSchema>;
export const analyticsRosterSchema = z.array(analyticsRosterRowSchema);

/* -------------------------------------------------------------------------- */
/* One child's paper, as they saw it, annotated with what happened            */
/* -------------------------------------------------------------------------- */

export const reviewContentSchema = z.object({
  type: questionContentTypeSchema,
  display_order: z.number(),
  text_content: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  media_id: z.string().nullable().optional(),
});

/** Both `is_correct` and `was_selected` — green/red renders with no second lookup. */
export const reviewOptionSchema = z.object({
  id: z.string(),
  value: z.string(),
  is_correct: z.boolean(),
  was_selected: z.boolean(),
});

/**
 * `null` when the child did not answer at all. Inside it, `is_correct: null`
 * means **pending, not wrong** — the AI marker hasn't reached it, confidence
 * was too low to act on, or a recording failed.
 */
export const reviewResponseSchema = z
  .object({
    id: z.string(),
    text_value: z.string(),
    transcript: z.string(),
    is_correct: z.boolean().nullable(),
    awarded_points: z.string(),
    graded_by: z.enum(['auto', 'ai']),
    grading_confidence: z.number().nullable(),
    error_type: z.string().nullable(),
    observation_note: z.string().nullable(),
  })
  .nullable();
export type ReviewResponse = z.infer<typeof reviewResponseSchema>;

export const reviewQuestionSchema = z.object({
  id: z.string(),
  order: z.number(),
  text: z.string(),
  question_type: questionTypeSchema,
  layout: questionLayoutSchema,
  fln_level: flnLevelSchema,
  subskill_name: z.string(),
  skill_name: z.string(),
  section_name: z.string(),
  contents: z.array(reviewContentSchema),
  options: z.array(reviewOptionSchema),
  response: reviewResponseSchema,
});
export type ReviewQuestion = z.infer<typeof reviewQuestionSchema>;

export const studentResponsesSchema = z.object({
  student_id: z.string(),
  full_name: z.string(),
  assessment_id: z.string(),
  assessment_name: z.string(),
  status: assignmentStatusSchema,
  items_attempted: z.number(),
  items_correct: z.number(),
  pending: z.number(),
  percentage: z.string(),
  questions: z.array(reviewQuestionSchema),
});
export type StudentResponses = z.infer<typeof studentResponsesSchema>;

/* -------------------------------------------------------------------------- */
/* Review queue — no JSON in the guide either; no resolution endpoint at all  */
/* -------------------------------------------------------------------------- */

/** Why a response is still pending — mirrors the guide's own prose on the subject. */
export const reviewQueueReasonSchema = z.enum(['ai_unavailable', 'low_confidence', 'file_upload']);
export type ReviewQueueReason = z.infer<typeof reviewQueueReasonSchema>;

export const reviewQueueItemSchema = z.object({
  student_id: z.string(),
  full_name: z.string(),
  question_id: z.string(),
  question_text: z.string(),
  question_type: questionTypeSchema,
  subskill_name: z.string(),
  reason: reviewQueueReasonSchema,
  reason_label: z.string(),
});
export type ReviewQueueItem = z.infer<typeof reviewQueueItemSchema>;
export const reviewQueueListSchema = z.array(reviewQueueItemSchema);
