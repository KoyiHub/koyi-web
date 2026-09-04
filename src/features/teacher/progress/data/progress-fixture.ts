/**
 * PROVISIONAL UI fixture data for the Class Progress screen, copied from the
 * current design reference. No Progress backend contract is confirmed yet —
 * see CURRENT.md, "Revisit / Contract Questions". `level` values reuse the
 * same Strong/Intermediate/Struggling vocabulary as `students-fixture.ts`;
 * this module contains no score-to-level calculation logic. Replace with a
 * TanStack Query hook behind this same shape once an endpoint exists; no
 * component here should need rewriting.
 */

import type { StudentLevel } from '@/features/teacher/students/data/students-fixture';

export const classContext = 'Primary 4 - Class A';

export interface LevelCounts {
  strong: number;
  intermediate: number;
  struggling: number;
}

export interface AssessmentComparison {
  previous: LevelCounts;
  latest: LevelCounts;
}

export const assessmentComparison: AssessmentComparison = {
  previous: { strong: 8, intermediate: 15, struggling: 9 },
  latest: { strong: 12, intermediate: 14, struggling: 6 },
};

export interface Movement {
  studentName: string;
  from: StudentLevel;
  to: StudentLevel;
  outcomeLabel: string;
  supportAreas: string[];
}

export const notableMovements: Movement[] = [
  {
    studentName: 'Amina Yusuf',
    from: 'intermediate',
    to: 'strong',
    outcomeLabel: 'Improved',
    supportAreas: ['Word reading', 'Comprehension'],
  },
  {
    studentName: 'Chidi Okoro',
    from: 'struggling',
    to: 'intermediate',
    outcomeLabel: 'Improved',
    supportAreas: ['Subtraction'],
  },
];

/** Restrained, qualitative only — no fabricated percentages or score deltas. */
export type SkillTrend = 'Improving' | 'Needs Focus';

export interface SkillProgressEntry {
  skill: string;
  trendLabel: SkillTrend;
}

export const skillProgress: SkillProgressEntry[] = [
  { skill: 'Reading Fluency', trendLabel: 'Improving' },
  { skill: 'Addition', trendLabel: 'Improving' },
  { skill: 'Subtraction', trendLabel: 'Needs Focus' },
  { skill: 'Comprehension', trendLabel: 'Improving' },
];
