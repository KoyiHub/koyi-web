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

export interface StudentNeedingAttention {
  studentId: string;
  name: string;
  primaryGap: string;
  lastAssessed: string;
}

export interface ClassDashboard {
  className: string;
  totalStudents: number;
  /** Students with at least one completed assessment this term. */
  assessedCount: number;
  /** Students flagged as needing attention (a subset of `assessedCount`). */
  attentionCount: number;
  /** Provisional trend label shown next to the attention count. */
  attentionTrend: string;
  performance: PerformanceSegment[];
  studentsNeedingAttention: StudentNeedingAttention[];
}

export const dashboardFixture: ClassDashboard = {
  className: 'Primary 4 — Class A',
  totalStudents: 32,
  assessedCount: 28,
  attentionCount: 12,
  attentionTrend: '+2%',
  performance: [
    { band: 'strong', label: 'Strong', students: 12, percentage: 43 },
    { band: 'intermediate', label: 'Intermediate', students: 10, percentage: 36 },
    { band: 'struggling', label: 'Struggling', students: 6, percentage: 21 },
  ],
  studentsNeedingAttention: [
    {
      studentId: 'stu-fatima-bello',
      name: 'Fatima Bello',
      primaryGap: 'Word Reading',
      lastAssessed: 'Aug 18, 2026',
    },
    {
      studentId: 'stu-samuel-ojo',
      name: 'Samuel Ojo',
      primaryGap: 'Subtraction',
      lastAssessed: 'Aug 18, 2026',
    },
    {
      studentId: 'stu-amina-yusuf',
      name: 'Amina Yusuf',
      primaryGap: 'Reading Comprehension',
      lastAssessed: 'Aug 18, 2026',
    },
  ],
};
