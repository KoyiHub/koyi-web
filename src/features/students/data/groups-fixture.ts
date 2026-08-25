/**
 * PROVISIONAL UI fixture data, copied from the current design reference.
 * No Groups backend contract is confirmed yet — see CURRENT.md, "Revisit /
 * Contract Questions". Replace with a TanStack Query hook behind this same
 * shape once an endpoint exists; no component here should need rewriting.
 */

export type GroupStatus = 'needs-intervention' | 'on-track' | 'exceeding-expectations';

export const groupStatusLabels: Record<GroupStatus, string> = {
  'needs-intervention': 'Needs Intervention',
  'on-track': 'On Track',
  'exceeding-expectations': 'Exceeding Expectations',
};

export interface Group {
  id: string;
  name: string;
  studentCount: number;
  primaryNeed: string;
  averagePerformance: number;
  status: GroupStatus;
}

export const groups: Group[] = [
  {
    id: 'grp-phonics-focus',
    name: 'Phonics Focus',
    studentCount: 8,
    primaryNeed: 'Letter Sounds & Blending',
    averagePerformance: 62,
    status: 'needs-intervention',
  },
  {
    id: 'grp-addition-masters',
    name: 'Addition Masters',
    studentCount: 12,
    primaryNeed: 'Advanced Number Bonds',
    averagePerformance: 88,
    status: 'exceeding-expectations',
  },
  {
    id: 'grp-early-readers',
    name: 'Early Readers',
    studentCount: 6,
    primaryNeed: 'Sight Words & Fluency',
    averagePerformance: 74,
    status: 'on-track',
  },
];
