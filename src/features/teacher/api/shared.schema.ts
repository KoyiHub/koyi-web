import { z } from 'zod';

import {
  assessmentStatusSchema,
  assessmentSubjectSchema,
  assessmentTypeSchema,
  learningLevelSchema,
  paginatedSchema,
  performanceBandSchema,
} from '@/lib/api/contracts';

/**
 * Shapes shared across every Teacher resource.
 *
 * PROVISIONAL, like the endpoints — see `api/endpoints.ts`. The question
 * shapes below mirror the Django models the backend team supplied
 * (AssessmentQuestion / AssessmentQuestionContent / AssessmentQuestionOption /
 * QuestionLayout), field for field, so the serializer that eventually replaces
 * MSW should drop straight in.
 */

export {
  assessmentStatusSchema,
  assessmentSubjectSchema,
  assessmentTypeSchema,
  learningLevelSchema,
  paginatedSchema,
  performanceBandSchema,
};
export type {
  AssessmentStatus,
  AssessmentSubject,
  AssessmentType,
  LearningLevel,
  PaginatedResult,
  PerformanceBand,
} from '@/lib/api/contracts';

/** The seven answer shapes a question can take. Mirrors `AssessmentQuestion.question_type`. */
export const questionTypeSchema = z.enum([
  'single_choice',
  'multiple_choice',
  'text',
  'audio',
  'number',
  'true_false',
  'file_upload',
]);
export type QuestionType = z.infer<typeof questionTypeSchema>;

/**
 * How a question is arranged on the child's screen. Mirrors the `QuestionLayout`
 * lookup table, which is a FK rather than a choice field on the backend — the
 * names are stable, so the client treats them as an enum and sends the name.
 */
export const questionLayoutSchema = z.enum([
  'MEDIA_GRID_CHOICE',
  'MEDIA_LIST_CHOICE',
  'COMPARISON_PANEL_CHOICE',
  'SPEECH_RESPONSE_PROMPT',
  'PASSAGE_COMPREHENSION_CHOICE',
]);
export type QuestionLayout = z.infer<typeof questionLayoutSchema>;

/** Mirrors `AssessmentQuestionContent.type`. */
export const questionContentTypeSchema = z.enum(['text', 'image', 'audio', 'video']);
export type QuestionContentType = z.infer<typeof questionContentTypeSchema>;

/** Mirrors `AssessmentQuestionOption.type`. */
export const questionOptionTypeSchema = z.enum(['text', 'audio', 'true_false', 'image']);
export type QuestionOptionType = z.infer<typeof questionOptionTypeSchema>;

/** A file in the media library, referenced by FK from contents, options and answers. */
export const mediaAssetSchema = z.object({
  id: z.string(),
  url: z.string(),
  type: questionContentTypeSchema,
  file_name: z.string(),
  /** Audio and video only; `null` for images. */
  duration_seconds: z.number().nullable(),
});
export type MediaAsset = z.infer<typeof mediaAssetSchema>;

/**
 * One block of a question's prompt. A question is a *sequence* of these —
 * a passage, then a picture, then a recorded instruction — ordered by
 * `display_order`, which is unique per question.
 */
export const questionContentSchema = z.object({
  id: z.string(),
  display_order: z.number(),
  type: questionContentTypeSchema,
  /** Set when `type` is `text`; `null` when the block carries media instead. */
  text_content: z.string().nullable(),
  media: mediaAssetSchema.nullable(),
  alt_text: z.string().nullable(),
  caption: z.string().nullable(),
});
export type QuestionContent = z.infer<typeof questionContentSchema>;

/**
 * One selectable answer.
 *
 * SECURITY BOUNDARY: the model has an `is_correct` flag and the answer model
 * has a `value`. Neither is represented here and neither is ever requested,
 * because a child sits this assessment in the same browser. Correctness and
 * scoring stay on the server.
 */
export const questionOptionSchema = z.object({
  id: z.string(),
  value: z.string(),
  type: questionOptionTypeSchema,
  media: mediaAssetSchema.nullable(),
});
export type QuestionOption = z.infer<typeof questionOptionSchema>;

/** Mirrors `AssessmentQuestion`, with its contents and options inlined. */
export const assessmentQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  description: z.string().nullable(),
  subject: assessmentSubjectSchema,
  /** Grade level the question targets, as a number (4 = Primary 4). */
  level: z.number(),
  /** Position within its assessment. Server-calculated; the client sends intent, not indexes. */
  order: z.number(),
  point: z.number(),
  question_type: questionTypeSchema,
  layout: questionLayoutSchema.nullable(),
  contents: z.array(questionContentSchema),
  options: z.array(questionOptionSchema),
});
export type AssessmentQuestion = z.infer<typeof assessmentQuestionSchema>;

/** The signed-in teacher, as needed by the app shell. */
export const teacherProfileSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  /** "Mrs.", "Mr." — rendered in the dashboard greeting. */
  title: z.string(),
  short_name: z.string(),
  email: z.string(),
  avatar_url: z.string().nullable(),
  school_name: z.string(),
  class_name: z.string(),
  student_count: z.number(),
});
export type TeacherProfile = z.infer<typeof teacherProfileSchema>;

/** Student summary as it appears in lists, pickers and dashboard tables. */
export const studentSummarySchema = z.object({
  id: z.string(),
  full_name: z.string(),
  student_code: z.string(),
  class_name: z.string(),
  level: learningLevelSchema,
  avatar_url: z.string().nullable(),
});
export type StudentSummary = z.infer<typeof studentSummarySchema>;
