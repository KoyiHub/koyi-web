import { z } from 'zod';

import { domainSchema, flnLevelSchema, movementSchema, narrativeSchema } from '@/lib/api/contracts';

/**
 * One child, by skill — `GET /v1/teacher/students/{id}/skills/`,
 * `frontend-integration.md` §5.5. Replaces the pre-refactor
 * `learningProfileSchema` (score-first: overall percentage, a single band,
 * "strengths"/"learning gaps") entirely — the level context a percentage
 * alone cannot carry is the whole point of this endpoint.
 */
export const skillBreakdownSchema = z.object({
  skill_name: z.string(),
  domain: domainSchema,
  /** The highest level the child passed in this skill. */
  highest_level_passed: flnLevelSchema.nullable(),
  /** The level they broke down at — usually `highest_level_passed + 1`. */
  broke_down_at: flnLevelSchema.nullable(),
  /** e.g. "Consonant blends and digraphs (L3)" — already formatted server-side. */
  weak_subskills: z.array(z.string()),
});
export type SkillBreakdown = z.infer<typeof skillBreakdownSchema>;

export const studentSkillsSchema = z.object({
  student_id: z.string(),
  full_name: z.string(),
  /** `null` when the child has not yet been placed in this domain. */
  literacy_level: flnLevelSchema.nullable(),
  numeracy_level: flnLevelSchema.nullable(),
  last_assessed_at: z.string().nullable(),
  skills: z.array(skillBreakdownSchema),
  /** Compares the last two placements per domain. `down` is a reading, not a failure. */
  movement: z.array(movementSchema),
  narrative: narrativeSchema,
});
export type StudentSkills = z.infer<typeof studentSkillsSchema>;
