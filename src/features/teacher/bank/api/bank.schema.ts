import { z } from 'zod';

import {
  domainSchema,
  flnLevelSchema,
  levelRangeSchema,
  paginatedSchema,
  questionContentTypeSchema,
  questionLayoutSchema,
  questionTypeSchema,
} from '@/lib/api/contracts';

/**
 * The taxonomy and the question bank — `frontend-integration.md` §5.2.
 *
 * The taxonomy is the spine of the product: 14 skills, 55 subskills, each
 * tagged to a domain and bounded by a level range. It is **server-owned**;
 * nothing in this client hardcodes a skill, a subskill or a level bound.
 *
 * The bank is **read-only to teachers**. Selecting a question is a client-side
 * prefill — pull it, fill the authoring form, let the teacher edit freely, and
 * post the result as a new assessment question with `source_question_id` set.
 * Nothing writes back here.
 *
 * These shapes DO carry `is_correct`: marking the right answer is what
 * authoring is. That is safe on this surface and forbidden on the runner's,
 * which is enforced by the import boundary in `eslint.config.js` rather than by
 * omitting the field here.
 */

/* -------------------------------------------------------------------------- */
/* Taxonomy                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * One subskill.
 *
 * `min_level` / `max_level` are the subskill's *own* bounds and are often
 * `null`. **Build the level picker from `level_range`**, which the server has
 * already resolved: the subskill's bounds when set, the parent skill's
 * otherwise. A question tagged outside it is rejected at authoring time, so
 * bound the control rather than letting a teacher discover the limit through a
 * `400`.
 */
export const subskillSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  min_level: flnLevelSchema.nullable(),
  max_level: flnLevelSchema.nullable(),
  level_range: levelRangeSchema,
});
export type Subskill = z.infer<typeof subskillSchema>;

export const skillSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  domain: domainSchema,
  min_level: flnLevelSchema,
  max_level: flnLevelSchema,
  is_core: z.boolean(),
  subskills: z.array(subskillSchema),
});
export type Skill = z.infer<typeof skillSchema>;

/** `GET /v1/teacher/bank/skills/` is unpaginated — a bare array. */
export const skillListSchema = z.array(skillSchema);

/* -------------------------------------------------------------------------- */
/* Bank questions                                                             */
/* -------------------------------------------------------------------------- */

/** One block of a question's prompt, in the order the child meets it. */
export const bankContentSchema = z.object({
  type: questionContentTypeSchema,
  display_order: z.number(),
  text_content: z.string().nullable().optional(),
  media_id: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
});
export type BankContent = z.infer<typeof bankContentSchema>;

/** One selectable answer, with the key — this is the teacher's surface. */
export const bankOptionSchema = z.object({
  type: z.string(),
  value: z.string(),
  is_correct: z.boolean(),
  media_id: z.string().nullable().optional(),
});
export type BankOption = z.infer<typeof bankOptionSchema>;

/** The subskill as embedded in a bank question — enough to prefill the form. */
export const bankSubskillRefSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  level_range: levelRangeSchema,
});

export const bankQuestionSchema = z.object({
  id: z.string(),
  content: z.string(),
  type: questionTypeSchema,
  layout: questionLayoutSchema.nullable(),
  fln_level: flnLevelSchema,
  subskill: bankSubskillRefSchema,
  skill_name: z.string(),
  domain: domainSchema,
  contents: z.array(bankContentSchema),
  options: z.array(bankOptionSchema),
});
export type BankQuestion = z.infer<typeof bankQuestionSchema>;

export const bankQuestionListSchema = paginatedSchema(bankQuestionSchema);
export type BankQuestionList = z.infer<typeof bankQuestionListSchema>;

/** Filters `GET /bank/questions/` accepts. All optional, all ANDed. */
export interface BankQuestionFilters {
  domain?: string | undefined;
  skill?: string | undefined;
  subskill?: string | undefined;
  fln_level?: number | undefined;
  type?: string | undefined;
  search?: string | undefined;
  page?: number | undefined;
}
