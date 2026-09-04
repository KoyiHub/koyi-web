import { z } from 'zod';

import { assessmentStatusSchema } from '@/lib/api/contracts';

/**
 * School overview — `frontend-integration.md` §4.7. The guide's design note
 * is explicit: this "currently leads with an average score. Once placement
 * lands it should lead with level distribution — how many children sit at
 * each of Levels 1–5, per domain." Placement is built (Phase 4), so this
 * leads with `level_distribution` from the start rather than shipping the
 * average-first version and revising it later.
 */
export const levelDistributionSchema = z.object({
  literacy: z.record(z.string(), z.number()),
  numeracy: z.record(z.string(), z.number()),
});
export type LevelDistribution = z.infer<typeof levelDistributionSchema>;

export const overviewSchema = z.object({
  students_count: z.number(),
  teachers_count: z.number(),
  assessments_count: z.number(),
  active_assessments: z.number(),
  status_breakdown: z.record(assessmentStatusSchema, z.number()),
  level_distribution: levelDistributionSchema,
  average_graded_score: z.string(),
  current_session_label: z.string(),
});
export type Overview = z.infer<typeof overviewSchema>;
