import { z } from 'zod';

import {
  assessmentStatusSchema,
  domainSchema,
  flnLevelSchema,
  paginatedSchema,
  questionContentTypeSchema,
  questionLayoutSchema,
  questionTypeSchema,
} from '@/lib/api/contracts';

/**
 * Authoring an assessment — `frontend-integration.md` §5.3.
 *
 * Authoring is incremental: a paper stays a `draft` while it is built, one
 * small request at a time, so nothing is lost if the teacher walks away. The
 * draft is real from the first request; nothing here is ever held only in
 * browser state.
 *
 * **Publish is a one-way door.** After it, children may sit the paper, so
 * `PATCH` and `DELETE` return `400`. The UI hides those controls rather than
 * letting the click fail.
 *
 * These shapes carry `is_correct` on the way out — marking the right answer is
 * what authoring is. The runner never reaches them; `eslint.config.js` enforces
 * that rather than this file omitting the field.
 */

/* -------------------------------------------------------------------------- */
/* Sections                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A **section is one sitting**: one domain, whatever skills the teacher chose,
 * mixed levels. Children take them one at a time, on different days if need be.
 */
export const sectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: domainSchema,
  instructions: z.string(),
  order: z.number(),
  /** `HH:MM:SS`, or `null` for untimed. Bounds the sitting from when the child opens it. */
  timer: z.string().nullable(),
  question_count: z.number(),
  /**
   * The subskills this section is *meant* to probe. Powers the coverage
   * warning: a section claiming to cover blending but carrying no blending
   * items is flagged before a child ever sits it.
   *
   * The doc's `POST` body sends plain subskill uuids, but the live `GET`
   * response expands each into a `{id, name, ...}` object instead — the
   * same "return the related object, not just its id" pattern the rest of
   * this API uses elsewhere (e.g. the school activity feed's refs). Nothing
   * in this app renders `covers` on the read side today, so this accepts
   * either shape without asserting on the object's exact fields.
   */
  covers: z.array(z.union([z.string(), z.object({ id: z.string() }).loose()])),
});
export type Section = z.infer<typeof sectionSchema>;

export const sectionListSchema = z.array(sectionSchema);

export interface CreateSectionInput {
  domain: string;
  name: string;
  instructions: string;
  timer: string | null;
  covers: string[];
}

/* -------------------------------------------------------------------------- */
/* Assessments                                                                */
/* -------------------------------------------------------------------------- */

export const assessmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  instructions: z.string(),
  status: assessmentStatusSchema,
  /** Six characters, minted at publish. Empty string while the paper is a draft. */
  code: z.string(),
  opens_at: z.string().nullable(),
  closes_at: z.string().nullable(),
  published_at: z.string().nullable(),
  teacher_name: z.string(),
  sections: z.array(sectionSchema),
  created_at: z.string(),
});
export type Assessment = z.infer<typeof assessmentSchema>;

export const assessmentListSchema = paginatedSchema(assessmentSchema);
export type AssessmentList = z.infer<typeof assessmentListSchema>;

export interface CreateAssessmentInput {
  name: string;
  instructions: string;
  opens_at: string | null;
  closes_at: string | null;
}

/* -------------------------------------------------------------------------- */
/* Questions                                                                  */
/* -------------------------------------------------------------------------- */

export const questionContentSchema = z.object({
  type: questionContentTypeSchema,
  display_order: z.number(),
  text_content: z.string().nullable().optional(),
  media_id: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
});
export type QuestionContent = z.infer<typeof questionContentSchema>;

export const questionOptionSchema = z.object({
  type: z.string(),
  value: z.string(),
  is_correct: z.boolean(),
  media_id: z.string().nullable().optional(),
});
export type QuestionOption = z.infer<typeof questionOptionSchema>;

/**
 * One authored question.
 *
 * `source_question_id` is set when the item came from the bank and `null` when
 * the teacher wrote it. It is what lets a child's performance on the same item
 * be compared across rounds — **always send it when prefilling from the bank.**
 *
 * `answer` carries the expected value for a `number` item. Without one the item
 * cannot be marked and stays pending, which is an authoring fault rather than a
 * child's error.
 */
export const authoredQuestionSchema = z.object({
  id: z.string().optional(),
  subskill_id: z.string(),
  fln_level: flnLevelSchema,
  question_type: questionTypeSchema,
  layout: questionLayoutSchema.nullable(),
  text: z.string(),
  description: z.string(),
  /** Decimal string, e.g. "1.00" — the server owns the arithmetic. */
  point: z.string(),
  source_question_id: z.string().nullable(),
  contents: z.array(questionContentSchema),
  options: z.array(questionOptionSchema),
  answer: z.object({ value: z.string() }).nullable(),
});
export type AuthoredQuestion = z.infer<typeof authoredQuestionSchema>;

export const sectionQuestionsSchema = z.object({
  questions: z.array(authoredQuestionSchema),
});
export type SectionQuestions = z.infer<typeof sectionQuestionsSchema>;

/* -------------------------------------------------------------------------- */
/* Coverage                                                                   */
/* -------------------------------------------------------------------------- */

/** One cell of the skill × level grid: how many items probe this subskill at this level. */
export const coverageCellSchema = z.object({
  subskill_id: z.string(),
  subskill_name: z.string(),
  skill_id: z.string(),
  skill_name: z.string(),
  domain: domainSchema,
  fln_level: flnLevelSchema,
  item_count: z.number(),
});
export type CoverageCell = z.infer<typeof coverageCellSchema>;

export const coverageSectionSchema = z.object({
  section_id: z.string(),
  section_name: z.string(),
  domain: domainSchema,
  question_count: z.number(),
  cells: z.array(coverageCellSchema),
  /** Subskills the section claims to cover but carries no items for. */
  gaps: z.array(z.string()),
});
export type CoverageSection = z.infer<typeof coverageSectionSchema>;

/**
 * What the paper can actually establish about a child.
 *
 * **`levels_probed` is the number that matters.** Placement reads a skill ×
 * level grid, so a paper covering one level can confirm that level but cannot
 * find where a child actually sits — regardless of how many questions it holds.
 */
export const coverageSchema = z.object({
  assessment_id: z.string(),
  question_count: z.number(),
  domains: z.array(domainSchema),
  levels_probed: z.array(flnLevelSchema),
  sections: z.array(coverageSectionSchema),
  /** Server-authored sentences, shown as-is while authoring. */
  warnings: z.array(z.string()),
});
export type Coverage = z.infer<typeof coverageSchema>;
