import { z } from 'zod';

/**
 * Contract primitives shared by both portals.
 *
 * Teacher and School Admin are separate applications, so neither imports the
 * other's modules. The handful of shapes they genuinely agree on — the FLN
 * band vocabulary and the list envelope — live here instead of being
 * duplicated or cross-imported. Portal-specific shapes stay in that portal's
 * own `shared.schema.ts`.
 *
 * PROVISIONAL: no confirmed Django/OpenAPI contract exists for these yet.
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
 * `count`/`next`/`previous`/`results`; our lists need the page *number* to
 * render "1 2 3 … 11" controls, so the contract assumed here is a
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
