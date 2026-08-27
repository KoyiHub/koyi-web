import { z } from 'zod';

/**
 * School dashboard analytics. PROVISIONAL — see
 * `@/features/school-admin/api/endpoints`.
 *
 * Every figure, including the FLN band counts, is computed server-side and
 * read straight off the response. The dashboard renders what it is given.
 */

/** Terms the dashboard can be scoped to. Sent as `?term=`. */
export const termFilterSchema = z.enum(['this_term', 'last_term', 'ytd']);
export type TermFilter = z.infer<typeof termFilterSchema>;

export const TERM_FILTER_LABEL: Record<TermFilter, string> = {
  this_term: 'This Term',
  last_term: 'Last Term',
  ytd: 'YTD',
};

export const TERM_FILTERS: TermFilter[] = ['this_term', 'last_term', 'ytd'];

const statSchema = z.object({
  value: z.number(),
  /** Percentage change against the previous period; `null` when not tracked. */
  change_percentage: z.number().nullable(),
});

/** One category (a grade or a subject) split across the three FLN bands. */
const bandBreakdownSchema = z.object({
  label: z.string(),
  strong: z.number(),
  intermediate: z.number(),
  struggling: z.number(),
});
export type BandBreakdown = z.infer<typeof bandBreakdownSchema>;

const trendPointSchema = z.object({
  label: z.string(),
  value: z.number(),
});
export type TrendPoint = z.infer<typeof trendPointSchema>;

export const dashboardSummarySchema = z.object({
  term: termFilterSchema,
  school_name: z.string(),
  location: z.string(),
  stats: z.object({
    total_teachers: statSchema,
    total_students: statSchema,
    active_classes: statSchema,
  }),
  learning_levels: z.object({
    by_grade: z.array(bandBreakdownSchema),
    by_subject: z.array(bandBreakdownSchema),
  }),
  progress_trend: z.object({
    points: z.array(trendPointSchema),
    net_improvement_percentage: z.number(),
  }),
});

export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
