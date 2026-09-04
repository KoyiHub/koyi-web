import { z } from 'zod';

/**
 * Contract primitives shared by every surface.
 *
 * Koyi has three surfaces — school management, teacher, and the assessment
 * runner a child touches — and they do not import each other's modules. The
 * shapes they genuinely agree on live here.
 *
 * Everything below mirrors `frontend-integration.md`. When that document moves,
 * this file moves with it.
 */

/* -------------------------------------------------------------------------- */
/* FLN vocabulary                                                             */
/* -------------------------------------------------------------------------- */

/**
 * A developmental FLN band, 1–5. **Not a grade** — a Level 4 child is not
 * "Primary 4", and grade/class are organisational only.
 *
 * Read it as *what the child needs taught next*, never as what they have
 * mastered: placement returns the lowest level the paper probed that the child
 * did not pass. Render it through `@/lib/fln/level`, never as a bare number.
 */
export const flnLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);
export type FlnLevel = z.infer<typeof flnLevelSchema>;

export const FLN_LEVELS = [1, 2, 3, 4, 5] as const satisfies readonly FlnLevel[];

/**
 * The two FLN domains. They move **independently** — a child can be Level 4 in
 * numeracy and Level 2 in literacy — so nothing may combine them into one
 * level, one score or one verdict.
 */
export const domainSchema = z.enum(['literacy', 'numeracy']);
export type Domain = z.infer<typeof domainSchema>;

/**
 * The levels a skill or subskill may be assessed at, resolved server-side from
 * the subskill's own bounds falling back to its parent skill's.
 *
 * Bound every level picker with this rather than letting a teacher discover the
 * limit through a `400`.
 */
export const levelRangeSchema = z.tuple([flnLevelSchema, flnLevelSchema]);
export type LevelRange = z.infer<typeof levelRangeSchema>;

/* -------------------------------------------------------------------------- */
/* Assessment lifecycle                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Where a paper sits in its life.
 *
 * `open` and `closed` follow from `opens_at`/`closes_at` and are decided
 * server-side, so the client renders `status` and never computes the window
 * itself. `published` is a one-way door: a published paper cannot be edited or
 * deleted, so those controls are hidden rather than allowed to fail.
 */
export const assessmentStatusSchema = z.enum(['draft', 'published', 'open', 'closed']);
export type AssessmentStatus = z.infer<typeof assessmentStatusSchema>;

/** One child's progress through one paper. */
export const assignmentStatusSchema = z.enum(['not_started', 'in_progress', 'finished', 'graded']);
export type AssignmentStatus = z.infer<typeof assignmentStatusSchema>;

/** One section within a sitting. Sections are taken in order, one at a time. */
export const sectionStatusSchema = z.enum(['locked', 'unlocked', 'in_progress', 'submitted']);
export type SectionStatus = z.infer<typeof sectionStatusSchema>;

/* -------------------------------------------------------------------------- */
/* Questions                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The closed set of answer shapes.
 *
 * Marking differs per type and the authoring form says so: choice and number
 * items mark instantly, `text` and `audio` go to the AI marker asynchronously,
 * and `file_upload` is never auto-marked.
 */
export const questionTypeSchema = z.enum([
  'single_choice',
  'multiple_choice',
  'true_false',
  'number',
  'text',
  'audio',
  'file_upload',
]);
export type QuestionType = z.infer<typeof questionTypeSchema>;

/**
 * The three types answered by choosing. These require at least one option with
 * `is_correct`; every other type must carry no options at all. Both are `400`s,
 * so the authoring form mirrors the rule rather than discovering it.
 */
export const OPTION_BASED_QUESTION_TYPES = [
  'single_choice',
  'multiple_choice',
  'true_false',
] as const satisfies readonly QuestionType[];

export function isOptionBased(type: QuestionType): boolean {
  return (OPTION_BASED_QUESTION_TYPES as readonly QuestionType[]).includes(type);
}

/**
 * How a question is arranged on the child's screen. Closed set: a layout the
 * client cannot render is useless, so the backend does not add to it alone.
 *
 * Note there is no column count in the contract — `media_grid_choice` derives
 * its columns from the options themselves (image tiles are wider than numbers).
 */
export const questionLayoutSchema = z.enum([
  'media_grid_choice',
  'media_list_choice',
  'comparison_panel_choice',
  'speech_response_prompt',
  'passage_comprehension_choice',
]);
export type QuestionLayout = z.infer<typeof questionLayoutSchema>;

/** Mirrors `AssessmentQuestionContent.type`. */
export const questionContentTypeSchema = z.enum(['text', 'image', 'audio', 'video']);
export type QuestionContentType = z.infer<typeof questionContentTypeSchema>;

/* -------------------------------------------------------------------------- */
/* Marking and movement                                                       */
/* -------------------------------------------------------------------------- */

/**
 * How much of a paper has actually been marked.
 *
 * Marking runs in two passes: choice and number items settle immediately, then
 * written and spoken answers come back from the AI marker and the child is
 * **placed again**. A level can therefore change minutes after first appearing
 * with nothing having gone wrong — so show this anywhere figures are shown.
 */
export const markingStatusSchema = z.object({
  total: z.number(),
  marked: z.number(),
  pending: z.number(),
});
export type MarkingStatus = z.infer<typeof markingStatusSchema>;

/**
 * How a child's level changed since the previous placement.
 *
 * `down` is not a failure to hide. Placement is absolute — each assessment sets
 * the level outright — so a child can move down, and that is a reading rather
 * than a regression to explain away.
 */
export const movementDirectionSchema = z.enum(['up', 'down', 'same', 'new']);
export type MovementDirection = z.infer<typeof movementDirectionSchema>;

export const movementSchema = z.object({
  domain: domainSchema,
  previous: flnLevelSchema.nullable(),
  current: flnLevelSchema,
  direction: movementDirectionSchema,
});
export type Movement = z.infer<typeof movementSchema>;

/**
 * An AI narrative laid over figures that were computed deterministically.
 *
 * **Always nullable.** It is `null` when the model was unavailable, and
 * `?narrative=false` returns the key as `null` rather than dropping it. The
 * figures are the diagnosis; the prose is a convenience over them, so every
 * screen renders correctly without it.
 */
export const narrativeSchema = z
  .object({
    summary: z.string(),
    attention: z.string(),
    strength: z.string(),
  })
  .nullable();
export type Narrative = z.infer<typeof narrativeSchema>;

/* -------------------------------------------------------------------------- */
/* Envelopes                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The error envelope every 4xx and 5xx uses.
 *
 * `message` is written server-side to be shown to a user as-is. `detail` maps
 * field names to errors for inline display. `request_id` is echoed in
 * `X-Request-ID` and appears in every log line for that request.
 */
export const apiErrorEnvelopeSchema = z.object({
  error: z.object({
    type: z.string(),
    message: z.string(),
    detail: z.unknown().nullable(),
    request_id: z.string(),
  }),
});
export type ApiErrorEnvelope = z.infer<typeof apiErrorEnvelopeSchema>;

/**
 * Page-numbered list envelope. 25 per page by default.
 *
 * `page_size` is **capped at 100 server-side**, and the response reports what
 * was actually applied — so read it back rather than echoing what was sent.
 */
export function paginatedSchema<TItem extends z.ZodType>(item: TItem) {
  return z.object({
    count: z.number(),
    page: z.number(),
    page_size: z.number(),
    num_pages: z.number(),
    next: z.string().nullable().optional(),
    previous: z.string().nullable().optional(),
    results: z.array(item),
  });
}

export interface PaginatedResult<TItem> {
  count: number;
  page: number;
  page_size: number;
  num_pages: number;
  next?: string | null;
  previous?: string | null;
  results: TItem[];
}

/* -------------------------------------------------------------------------- */
/* Superseded — scheduled for removal                                         */
/* -------------------------------------------------------------------------- */

/**
 * DEPRECATED — the score-first vocabulary this product exists to avoid.
 *
 * `frontend-integration.md` §9 rules out ranking children with strong/weak
 * badges: a level says what a child can do and what comes next, and a class
 * with more Level 1 children is differently composed, not worse.
 *
 * These stay only so the teacher and school screens that still render them keep
 * compiling. Each is removed by the phase that rewrites its consumers —
 * teacher assessments in Phase 1, results and student profiles in Phase 4,
 * school management in Phase 5. **Do not reach for them in new code.**
 *
 * @deprecated Use `flnLevelSchema` and `@/lib/fln/level`.
 */
export const performanceBandSchema = z.enum(['strong', 'intermediate', 'struggling']);
/** @deprecated See {@link performanceBandSchema}. */
export type PerformanceBand = z.infer<typeof performanceBandSchema>;

/** @deprecated See {@link performanceBandSchema}. */
export const learningLevelSchema = z.enum(['strong', 'intermediate', 'struggling', 'beginner']);
/** @deprecated See {@link performanceBandSchema}. */
export type LearningLevel = z.infer<typeof learningLevelSchema>;

/**
 * DEPRECATED — term framing on a diagnostic round, ruled out by §9. A paper is
 * not a termly exam, so "Baseline / Midline / Endline" is the wrong axis.
 *
 * @deprecated Removed with the assessment library rewrite in Phase 1.
 */
export const assessmentTypeSchema = z.enum(['baseline', 'midline', 'endline', 'practice']);
/** @deprecated See {@link assessmentTypeSchema}. */
export type AssessmentType = z.infer<typeof assessmentTypeSchema>;

/**
 * DEPRECATED — the contract says "domain", and "subject" invites the exam
 * reading the product is trying to shed.
 *
 * @deprecated Use {@link domainSchema}.
 */
export const assessmentSubjectSchema = domainSchema;
/** @deprecated Use {@link Domain}. */
export type AssessmentSubject = Domain;

/**
 * DEPRECATED — the pre-contract lifecycle. Superseded by
 * {@link assessmentStatusSchema}'s `draft | published | open | closed`.
 *
 * @deprecated Removed with the assessment library rewrite in Phase 1.
 */
export const legacyAssessmentStatusSchema = z.enum(['draft', 'scheduled', 'active', 'completed']);
/** @deprecated See {@link legacyAssessmentStatusSchema}. */
export type LegacyAssessmentStatus = z.infer<typeof legacyAssessmentStatusSchema>;
