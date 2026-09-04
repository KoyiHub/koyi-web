import { z } from 'zod';

import {
  assessmentQuestionSchema,
  assessmentSubjectSchema,
  paginatedSchema,
  questionTypeSchema,
} from '@/features/teacher/api/shared.schema';
import { difficultySchema } from '@/features/teacher/assessments/api/assessment.schema';

/**
 * PROVISIONAL question bank contracts — see `../../api/endpoints.ts`.
 *
 * A bank item is a real question, not a flat row: it carries the same
 * `contents` blocks, `options`, `question_type` and `layout` as a question
 * inside an assessment, so dropping one into the builder is a copy rather than
 * a translation.
 *
 * SECURITY BOUNDARY: no entry here carries a correct answer, an `is_correct`
 * flag, or scoring logic. Reviewing a question is not the same as holding its
 * answer key, and this app is also used with a child watching.
 */

/** How ready a question is for use with children. */
export const bankStatusSchema = z.enum(['production_ready', 'needs_review', 'retired']);
export type BankStatus = z.infer<typeof bankStatusSchema>;

export const bankQuestionSchema = assessmentQuestionSchema.omit({ order: true }).extend({
  /** Human-facing reference, e.g. "KOYI-1042". Shown so teachers can quote it. */
  reference: z.string(),
  skill: z.string(),
  difficulty: difficultySchema,
  status: bankStatusSchema,
  /** Times this question has been used in an assessment. */
  usage_count: z.number(),
  updated_label: z.string(),
});
export type BankQuestion = z.infer<typeof bankQuestionSchema>;

export const bankListSchema = paginatedSchema(bankQuestionSchema);
export type BankList = z.infer<typeof bankListSchema>;

/** Counts for the filter rail. Server-supplied so they stay right across pages. */
export const bankSummarySchema = z.object({
  total: z.number(),
  production_ready: z.number(),
  needs_review: z.number(),
  by_subject: z.array(
    z.object({
      subject: assessmentSubjectSchema,
      label: z.string(),
      count: z.number(),
    }),
  ),
  by_question_type: z.array(
    z.object({
      question_type: questionTypeSchema,
      label: z.string(),
      count: z.number(),
    }),
  ),
  by_level: z.array(
    z.object({
      level: z.number(),
      label: z.string(),
      count: z.number(),
    }),
  ),
});
export type BankSummary = z.infer<typeof bankSummarySchema>;
