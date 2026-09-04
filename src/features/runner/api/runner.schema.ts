import { z } from 'zod';

import {
  domainSchema,
  flnLevelSchema,
  questionContentTypeSchema,
  questionLayoutSchema,
  questionTypeSchema,
  sectionStatusSchema,
} from '@/lib/api/contracts';

/**
 * The assessment runner's own contract — `frontend-integration.md` §6.
 *
 * Written out longhand rather than derived from a teacher schema. An
 * `.omit({ is_correct: true })` someone later deletes fails silently; a
 * schema that never had the field fails loudly (a Zod parse error) if the
 * server ever sends one. `eslint.config.js` backs this up by forbidding
 * `features/runner/**` from importing teacher modules at all.
 *
 * SECURITY BOUNDARY: nothing below carries `is_correct`, a mark, or a level.
 * The runner only ever knows what a child picked or said.
 */

export const verifyInputSchema = z.object({
  assessment_code: z.string(),
  code: z.string(),
});
export type VerifyInput = z.infer<typeof verifyInputSchema>;

export const runnerSectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: domainSchema,
  order: z.number(),
  /** `HH:MM:SS`, or `null` for untimed. */
  timer: z.string().nullable(),
  status: sectionStatusSchema,
  question_count: z.number(),
  started_at: z.string().nullable(),
  submitted_at: z.string().nullable(),
  /** Set once the section is started. The clock the child is actually bound by. */
  expires_at: z.string().nullable().optional(),
});
export type RunnerSection = z.infer<typeof runnerSectionSchema>;

export const assessmentOverviewSchema = z.object({
  assessment_id: z.string(),
  name: z.string(),
  instructions: z.string(),
  code: z.string(),
  student_name: z.string(),
  status: z.string(),
  sections: z.array(runnerSectionSchema),
});
export type AssessmentOverview = z.infer<typeof assessmentOverviewSchema>;

export const verifyResponseSchema = z.object({
  session: z.string(),
  expires_at: z.string(),
  assessment: assessmentOverviewSchema,
});
export type VerifyResponse = z.infer<typeof verifyResponseSchema>;

/* -------------------------------------------------------------------------- */
/* Questions — no `is_correct` anywhere below                                 */
/* -------------------------------------------------------------------------- */

export const runnerMediaSchema = z.object({
  id: z.string(),
  url: z.string(),
  type: z.string(),
});

export const runnerContentSchema = z.object({
  type: questionContentTypeSchema,
  display_order: z.number(),
  text_content: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  media: runnerMediaSchema.nullable().optional(),
});
export type RunnerContent = z.infer<typeof runnerContentSchema>;

/** No `is_correct`. This is the whole point of a longhand runner schema. */
export const runnerOptionSchema = z.object({
  id: z.string(),
  type: z.string(),
  value: z.string(),
  media: runnerMediaSchema.nullable().optional(),
});
export type RunnerOption = z.infer<typeof runnerOptionSchema>;

export const runnerQuestionSchema = z.object({
  id: z.string(),
  order: z.number(),
  text: z.string(),
  question_type: questionTypeSchema,
  layout: questionLayoutSchema,
  point: z.string(),
  fln_level: flnLevelSchema.optional(),
  subskill_name: z.string(),
  contents: z.array(runnerContentSchema),
  options: z.array(runnerOptionSchema),
});
export type RunnerQuestion = z.infer<typeof runnerQuestionSchema>;

export const startSectionResponseSchema = z.object({
  section: runnerSectionSchema,
  questions: z.array(runnerQuestionSchema),
});
export type StartSectionResponse = z.infer<typeof startSectionResponseSchema>;

export const putResponseInputSchema = z.object({
  text_value: z.string(),
  media_id: z.string().nullable(),
  option_ids: z.array(z.string()),
});
export type PutResponseInput = z.infer<typeof putResponseInputSchema>;

/**
 * Submitting the last section finalises the paper on its own — `status:
 * "finished"` means go straight to the summary screen. There is no further
 * submit call and no confirm step (§9).
 */
export const submitSectionResponseSchema = z.object({
  status: z.enum(['in_progress', 'finished']),
  assessment: assessmentOverviewSchema,
});
export type SubmitSectionResponse = z.infer<typeof submitSectionResponseSchema>;
