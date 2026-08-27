import { z } from 'zod';

/**
 * Shapes shared across every School Admin resource.
 *
 * PROVISIONAL, like the endpoints — see `api/endpoints.ts`.
 */

/**
 * FLN performance band as returned by the server.
 *
 * The band is always read off the response. The mapping from a raw score to a
 * band is a scoring rule and stays on the backend: nothing in the browser
 * decides which band a child falls into.
 */
export const performanceBandSchema = z.enum(['strong', 'intermediate', 'struggling']);
export type PerformanceBand = z.infer<typeof performanceBandSchema>;

/** A student's overall learning level. `beginner` covers a child with no assessment yet. */
export const learningLevelSchema = z.enum(['strong', 'intermediate', 'struggling', 'beginner']);
export type LearningLevel = z.infer<typeof learningLevelSchema>;

export const assessmentSubjectSchema = z.enum(['literacy', 'numeracy']);
export type AssessmentSubject = z.infer<typeof assessmentSubjectSchema>;

export const assessmentTypeSchema = z.enum(['baseline', 'midline', 'endline', 'practice']);
export type AssessmentType = z.infer<typeof assessmentTypeSchema>;

export const assessmentStatusSchema = z.enum(['draft', 'scheduled', 'active', 'completed']);
export type AssessmentStatus = z.infer<typeof assessmentStatusSchema>;

/**
 * Page-numbered list envelope. DRF's default paginator returns
 * `count`/`next`/`previous`/`results`; the School Admin lists need the page
 * *number* to render "1 2 3 … 11" controls, so the contract assumed here is a
 * `PageNumberPagination` subclass that also emits `page`/`num_pages`.
 */
export function paginatedSchema<TItem extends z.ZodType>(item: TItem) {
  return z.object({
    count: z.number(),
    page: z.number(),
    page_size: z.number(),
    num_pages: z.number(),
    results: z.array(item),
  });
}

export interface PaginatedResult<TItem> {
  count: number;
  page: number;
  page_size: number;
  num_pages: number;
  results: TItem[];
}

export const gradeSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number(),
});
export type Grade = z.infer<typeof gradeSchema>;

export const gradeListSchema = z.object({
  count: z.number(),
  results: z.array(gradeSchema),
});

export const schoolSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  logo_url: z.string().nullable(),
  motto: z.string(),
  class_system: z.enum(['primary', 'grade']),
  current_session: z.string(),
  current_term: z.string(),
  term_starts_on: z.string(),
  term_ends_on: z.string(),
  timezone: z.string(),
});
export type School = z.infer<typeof schoolSchema>;

/** Teacher summary as embedded in a class payload. */
export const classTeacherSchema = z.object({
  id: z.string(),
  teacher_id: z.string(),
  full_name: z.string(),
  email: z.string(),
  is_form_teacher: z.boolean(),
});
export type ClassTeacher = z.infer<typeof classTeacherSchema>;
