import { z } from 'zod';

import { assessmentStatusSchema } from '@/lib/api/contracts';

/**
 * School overview — `frontend-integration.md` §4.7 exactly.
 *
 * `level_distribution.levels` keys every Level 1–5 per domain, even at
 * zero — a chart that dropped empty levels would read as a narrower spread
 * than the class actually has. `unplaced` is per domain and counts active
 * children no assessment has reached yet — "usually the most actionable
 * figure on the dashboard", per the doc, so it gets its own called-out
 * line rather than folding into the chart. `average_graded_score` averages
 * across two independent domains and describes neither — kept because a
 * school that has always had one will look for it, but never the headline.
 */
export const levelDistributionSchema = z.object({
  levels: z.object({
    literacy: z.record(z.string(), z.number()),
    numeracy: z.record(z.string(), z.number()),
  }),
  unplaced: z.object({
    literacy: z.number(),
    numeracy: z.number(),
  }),
});
export type LevelDistribution = z.infer<typeof levelDistributionSchema>;

export const overviewSchema = z.object({
  students: z.number(),
  teachers: z.number(),
  assessments: z.number(),
  active_assessments: z.number(),
  assessment_status_breakdown: z.record(assessmentStatusSchema, z.number()),
  level_distribution: levelDistributionSchema,
  average_graded_score: z.string(),
  /** A bare string, e.g. `"2025/2026"` — not the `current_session` object §4.2's profile carries. */
  current_session: z.string(),
});
export type Overview = z.infer<typeof overviewSchema>;
