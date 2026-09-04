import { z } from 'zod';

import { domainSchema, flnLevelSchema } from '@/lib/api/contracts';

/**
 * Groups and lesson plans — `frontend-integration.md` §5.6. No JSON example
 * is given for the group/member shapes themselves (only prose plus the
 * `POST` create body), so the response shapes below are this client's best
 * reading of that prose, not a confirmed contract — flagged here rather
 * than guessed at silently. What IS explicit and followed exactly: the
 * criterion types and their fields, `resource_tier`'s three values, the
 * lesson-plan `status` enum and its `content` shape, and the member row's
 * `join_reason`/`left_at` fields.
 */

export const criterionTypeSchema = z.enum(['level', 'skill', 'subskill', 'class']);
export type CriterionType = z.infer<typeof criterionTypeSchema>;

export const levelComparatorSchema = z.enum(['eq', 'gte', 'lte']);
export type LevelComparator = z.infer<typeof levelComparatorSchema>;

/** A rule naming nothing is a `400` server-side — it would otherwise match everyone. */
export const criterionSchema = z.object({
  type: criterionTypeSchema,
  level: flnLevelSchema.optional(),
  comparator: levelComparatorSchema.optional(),
  skill: z.string().optional(),
  subskill: z.string().optional(),
  class: z.string().optional(),
});
export type Criterion = z.infer<typeof criterionSchema>;

export const resourceTierSchema = z.enum(['minimal', 'basic', 'equipped']);
export type ResourceTier = z.infer<typeof resourceTierSchema>;

/** `matched` — the criteria placed them. `added` — a teacher's own judgement, never auto-removed. */
export const joinReasonSchema = z.enum(['matched', 'added']);
export type JoinReason = z.infer<typeof joinReasonSchema>;

export const groupMemberSchema = z.object({
  student_id: z.string(),
  full_name: z.string(),
  join_reason: joinReasonSchema,
  joined_at: z.string(),
  /** `null` means current. History, not a toggle — a child who leaves and rejoins has two rows. */
  left_at: z.string().nullable(),
});
export type GroupMember = z.infer<typeof groupMemberSchema>;

export const groupSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: domainSchema,
  resource_tier: resourceTierSchema,
  criteria: z.array(criterionSchema),
  size: z.number(),
  /** Holds for 14 days before restructuring may touch it, so a plan survives long enough to deliver. */
  stable_until: z.string(),
  /** Below 4 children the group is flagged, not dissolved — a plan mid-window shouldn't be stranded. */
  is_thin: z.boolean(),
  archived: z.boolean(),
});
export type Group = z.infer<typeof groupSchema>;

/** The group is filled on creation and on retrieve — the teacher sees who matched, not an empty shell. */
export const groupDetailSchema = groupSchema.extend({
  members: z.array(groupMemberSchema),
});
export type GroupDetail = z.infer<typeof groupDetailSchema>;

export const groupListSchema = z.array(groupSchema);
export const groupMemberListSchema = z.array(groupMemberSchema);

export interface CreateGroupInput {
  name: string;
  domain: 'literacy' | 'numeracy';
  resource_tier: ResourceTier;
  criteria: Criterion[];
}

/* -------------------------------------------------------------------------- */
/* Lesson plans                                                               */
/* -------------------------------------------------------------------------- */

export const lessonPlanStatusSchema = z.enum(['ready', 'fallback', 'failed', 'generating']);
export type LessonPlanStatus = z.infer<typeof lessonPlanStatusSchema>;

export const lessonPlanStepSchema = z.object({
  teacher_does: z.string(),
  children_do: z.string(),
  minutes: z.number(),
});
export type LessonPlanStep = z.infer<typeof lessonPlanStepSchema>;

export const lessonPlanContentSchema = z.object({
  objective: z.string(),
  duration_minutes: z.number(),
  materials: z.array(z.string()),
  steps: z.array(lessonPlanStepSchema),
  checks: z.array(z.string()),
  common_errors: z.array(z.string()),
  success_criteria: z.array(z.string()),
  note: z.string().nullable(),
});
export type LessonPlanContent = z.infer<typeof lessonPlanContentSchema>;

const lessonPlanMemberSnapshotSchema = z.object({
  student_id: z.string(),
  full_name: z.string(),
});

export const lessonPlanSchema = z.object({
  id: z.string(),
  status: lessonPlanStatusSchema,
  /** `null` while `generating` or on `failed`. */
  content: lessonPlanContentSchema.nullable(),
  /** Who was in the group when the plan was written — stays coherent as children move. */
  member_snapshot: z.array(lessonPlanMemberSnapshotSchema),
  was_helpful: z.boolean().nullable(),
  /** Set by the server on first `GET`. */
  opened_at: z.string().nullable(),
  generated_at: z.string(),
});
export type LessonPlan = z.infer<typeof lessonPlanSchema>;

/** A short note beside the group plan, for a child whose weaknesses diverge from it. */
export const studentLessonPlanSchema = lessonPlanSchema;
export type StudentLessonPlan = z.infer<typeof studentLessonPlanSchema>;
