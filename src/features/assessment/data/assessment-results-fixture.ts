/**
 * PROVISIONAL UI fixture data for the teacher Assessment Results/Diagnostics
 * screen, copied from the current design reference. No Assessment Results
 * backend contract is confirmed yet (see CURRENT.md, "Revisit / Contract
 * Questions" — item 8, FLN Strong/Intermediate/Struggling mapping). This
 * module contains no score-to-level calculation logic; `level` and
 * `percentage` are both supplied display data, not derived from each other.
 *
 * `studentResults` entries deliberately reuse names/ids from
 * `students-fixture.ts` where they exist, but carry their own
 * percentage/level for this particular assessment sitting — these are two
 * separate provisional figures for the same students, supplied at different
 * times, following the same precedent as Group Detail vs Groups Overview
 * (CURRENT.md item 13). Not yet reconciled.
 *
 * Replace with a TanStack Query hook behind this same shape once a Results
 * endpoint exists; no component here should need rewriting.
 */

import type { StudentLevel } from '@/features/students/data/students-fixture';

export interface ResultsContext {
  className: string;
  assessmentName: string;
  completedDate: string;
  studentsAssessed: number;
}

export const resultsContext: ResultsContext = {
  className: 'Primary 4 - Class A',
  assessmentName: 'FLN Assessment',
  completedDate: 'Aug 18, 2026',
  studentsAssessed: 32,
};

export interface LevelSummary {
  strong: number;
  intermediate: number;
  struggling: number;
}

/** Counts sum to `resultsContext.studentsAssessed`; percentages are derived, not hard-coded. */
export const levelSummary: LevelSummary = {
  strong: 10,
  intermediate: 14,
  struggling: 8,
};

export interface SkillPerformanceEntry {
  skill: string;
  percentage: number;
}

export const skillPerformance: SkillPerformanceEntry[] = [
  { skill: 'Reading', percentage: 68 },
  { skill: 'Comprehension', percentage: 61 },
  { skill: 'Mathematics', percentage: 76 },
];

export interface LearningGapEntry {
  skill: string;
  studentCount: number;
}

export const commonLearningGaps: LearningGapEntry[] = [
  { skill: 'Word Reading', studentCount: 12 },
  { skill: 'Reading Comprehension', studentCount: 9 },
  { skill: 'Subtraction', studentCount: 7 },
  { skill: 'Letter Sounds', studentCount: 5 },
];

export interface StudentResultEntry {
  /** Matches a `students-fixture.ts` id where the reference student exists. */
  studentId: string;
  name: string;
  percentage: number;
  level: StudentLevel;
}

export const studentResults: StudentResultEntry[] = [
  { studentId: 'stu-amina-yusuf', name: 'Amina Yusuf', percentage: 67, level: 'intermediate' },
  { studentId: 'stu-chinedu-okafor', name: 'Chinedu Okafor', percentage: 82, level: 'strong' },
  { studentId: 'stu-fatima-bello', name: 'Fatima Bello', percentage: 58, level: 'intermediate' },
  { studentId: 'stu-zainab-idris', name: 'Zainab Idris', percentage: 39, level: 'struggling' },
];
