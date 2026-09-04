/**
 * PROVISIONAL UI fixture data for the Group Detail screen, copied from the
 * current design reference. No Group Detail backend contract is confirmed
 * yet — see CURRENT.md, "Revisit / Contract Questions". Only the reference
 * group (Phonics Focus) has detail content; other groups intentionally have
 * none here rather than inventing figures. Replace with a TanStack Query
 * hook behind this same shape once an endpoint exists; no component here
 * should need rewriting.
 *
 * `metrics.averagePercentage` (42%) is a separate provisional figure from
 * `Group.averagePerformance` (62%) in `groups-fixture.ts` for the same
 * group — the overview card and the detail metric were supplied as distinct
 * reference values and are kept as-is rather than reconciled.
 */

export type GroupStudentStatus = 'needs-help' | 'intermediate' | 'strong';

export const groupStudentStatusLabels: Record<GroupStudentStatus, string> = {
  'needs-help': 'Needs Help',
  intermediate: 'Intermediate',
  strong: 'Strong',
};

export interface GroupMetrics {
  averagePercentage: number;
  growthPercentagePoints: number;
  criticalNeeds: number;
  lastSessionLabel: string;
}

export interface GroupStudentPreview {
  name: string;
  note: string;
  status: GroupStudentStatus;
}

export interface GroupSkillGap {
  skill: string;
  strugglingCount: number;
  totalCount: number;
}

export interface GroupRecentAssessment {
  date: string;
  name: string;
  averagePercentage: number;
  status: string;
}

export interface GroupDetail {
  groupId: string;
  grade: string;
  studentCountLabel: string;
  description: string;
  metrics: GroupMetrics;
  studentsPreview: GroupStudentPreview[];
  skillGaps: GroupSkillGap[];
  recentAssessments: GroupRecentAssessment[];
  recommendations: string[];
}

export const groupDetails: Record<string, GroupDetail> = {
  'grp-phonics-focus': {
    groupId: 'grp-phonics-focus',
    grade: 'Primary 4',
    studentCountLabel: '8 Students',
    description: 'Targeted skill building for early reading',
    metrics: {
      averagePercentage: 42,
      growthPercentagePoints: 15,
      criticalNeeds: 3,
      lastSessionLabel: '2 Days Ago',
    },
    studentsPreview: [
      { name: 'Aisha O.', note: 'Struggling with CVC words', status: 'needs-help' },
      { name: 'Emeka I.', note: 'Improving on Digraphs', status: 'intermediate' },
      { name: 'Fatima K.', note: 'Consistent progress', status: 'strong' },
    ],
    skillGaps: [
      { skill: 'CVC Word Blending', strugglingCount: 6, totalCount: 8 },
      { skill: 'Initial Consonant Sounds', strugglingCount: 4, totalCount: 8 },
    ],
    recentAssessments: [
      {
        date: 'Oct 12, 2023',
        name: 'Consonant Blends',
        averagePercentage: 45,
        status: 'Completed',
      },
      { date: 'Oct 05, 2023', name: 'Vowel Sounds', averagePercentage: 38, status: 'Completed' },
    ],
    recommendations: ['Interactive CVC Game', 'Phonics Flashcards'],
  },
};

export function findGroupDetailById(groupId: string): GroupDetail | undefined {
  return groupDetails[groupId];
}
