/**
 * PROVISIONAL UI fixture data. These figures and skill labels are illustrative
 * only — the FLN performance-band mapping and the dashboard backend contract are
 * both unconfirmed. Replace this module with a TanStack Query hook returning the
 * same shape once the endpoint exists; no component should need rewriting.
 */

export type PerformanceBand = 'strong' | 'intermediate' | 'struggling';

export interface PerformanceSegment {
  band: PerformanceBand;
  label: string;
  students: number;
  percentage: number;
}

export interface LearningGap {
  skill: string;
  strugglingStudents: number;
}

export interface ClassDashboard {
  className: string;
  totalStudents: number;
  performance: PerformanceSegment[];
  learningGaps: LearningGap[];
}

export const dashboardFixture: ClassDashboard = {
  className: 'Primary 4 — Class A',
  totalStudents: 32,
  performance: [
    { band: 'strong', label: 'Strong', students: 10, percentage: 31 },
    { band: 'intermediate', label: 'Intermediate', students: 14, percentage: 44 },
    { band: 'struggling', label: 'Struggling', students: 8, percentage: 25 },
  ],
  learningGaps: [
    { skill: 'Word Reading', strugglingStudents: 12 },
    { skill: 'Reading Comprehension', strugglingStudents: 9 },
    { skill: 'Subtraction', strugglingStudents: 7 },
    { skill: 'Letter Sounds', strugglingStudents: 5 },
  ],
};
