/**
 * PROVISIONAL seed for Recent Activity and Class Performance.
 *
 * Split out of `teacher-seed.ts` so the roster and the reporting timeline can
 * be read on their own. Both are illustrative; see the security note at the top
 * of `teacher-seed.ts`.
 */

import { CLASS_NAME, students, TERM_LABEL } from './teacher-seed';

export interface SeedActivity {
  id: string;
  type:
    | 'assessment_completed'
    | 'assessment_assigned'
    | 'student_flagged'
    | 'group_updated'
    | 'report_exported'
    | 'insight_generated';
  title: string;
  description: string;
  occurred_at: string;
  day_label: string;
  student_id: string | null;
  assessment_id: string | null;
}

/**
 * The server buckets each item into a day so paging can never split a day
 * inconsistently — the client groups on `day_label` and nothing else.
 */
export const activity: SeedActivity[] = [
  {
    id: 'act-01',
    type: 'insight_generated',
    title: 'New insight: word reading gap',
    description: 'Koyi flagged 9 children whose decoding scores trail their comprehension scores.',
    occurred_at: '2026-08-18T09:12:00Z',
    day_label: 'Today',
    student_id: null,
    assessment_id: null,
  },
  {
    id: 'act-02',
    type: 'assessment_completed',
    title: 'Term 1 Literacy Baseline completed',
    description: '28 of 32 students submitted. Class average 64%.',
    occurred_at: '2026-08-18T08:40:00Z',
    day_label: 'Today',
    student_id: null,
    assessment_id: 'asm-literacy-baseline',
  },
  {
    id: 'act-03',
    type: 'student_flagged',
    title: 'Fatima Bello flagged for word reading',
    description: 'Scored 38% on decoding, 22 points below the class average.',
    occurred_at: '2026-08-18T08:41:00Z',
    day_label: 'Today',
    student_id: 'stu-fatima-bello',
    assessment_id: 'asm-literacy-baseline',
  },
  {
    id: 'act-04',
    type: 'student_flagged',
    title: 'Samuel Ojo flagged for subtraction',
    description: 'Missed every borrowing item on the numeracy check.',
    occurred_at: '2026-08-17T15:05:00Z',
    day_label: 'Yesterday',
    student_id: 'stu-samuel-ojo',
    assessment_id: 'asm-numeracy-check',
  },
  {
    id: 'act-05',
    type: 'report_exported',
    title: 'Class report exported',
    description: 'Term 1 Literacy Baseline results exported as CSV.',
    occurred_at: '2026-08-17T13:20:00Z',
    day_label: 'Yesterday',
    student_id: null,
    assessment_id: 'asm-literacy-baseline',
  },
  {
    id: 'act-06',
    type: 'assessment_assigned',
    title: 'Numeracy Progress Check assigned',
    description: 'Assigned to 32 students. Opens Monday, deadline Friday 4:00 PM.',
    occurred_at: '2026-08-17T09:00:00Z',
    day_label: 'Yesterday',
    student_id: null,
    assessment_id: 'asm-numeracy-check',
  },
  {
    id: 'act-07',
    type: 'group_updated',
    title: 'Word Reading focus group updated',
    description: '3 students added after the baseline results came in. Group is now 9 children.',
    occurred_at: '2026-08-15T11:30:00Z',
    day_label: 'Aug 15, 2026',
    student_id: null,
    assessment_id: null,
  },
  {
    id: 'act-08',
    type: 'assessment_completed',
    title: 'Numeracy Progress Check completed',
    description: '26 of 32 students submitted. Class average 71%.',
    occurred_at: '2026-08-14T14:10:00Z',
    day_label: 'Aug 14, 2026',
    student_id: null,
    assessment_id: 'asm-numeracy-check',
  },
  {
    id: 'act-09',
    type: 'student_flagged',
    title: 'Amina Yusuf flagged for reading comprehension',
    description: 'Answered 4 of 10 comprehension items correctly.',
    occurred_at: '2026-08-14T14:12:00Z',
    day_label: 'Aug 14, 2026',
    student_id: 'stu-amina-yusuf',
    assessment_id: 'asm-numeracy-check',
  },
  {
    id: 'act-10',
    type: 'insight_generated',
    title: 'New insight: listening comprehension up 12 points',
    description: 'Class average rose from 58 to 70 between the May midline and August baseline.',
    occurred_at: '2026-08-12T10:00:00Z',
    day_label: 'Aug 12, 2026',
    student_id: null,
    assessment_id: null,
  },
  {
    id: 'act-11',
    type: 'assessment_assigned',
    title: 'Term 1 Literacy Baseline assigned',
    description: 'Assigned to 32 students with a 30-minute limit.',
    occurred_at: '2026-08-11T08:15:00Z',
    day_label: 'Aug 11, 2026',
    student_id: null,
    assessment_id: 'asm-literacy-baseline',
  },
  {
    id: 'act-12',
    type: 'group_updated',
    title: 'Subtraction focus group created',
    description: '6 students grouped around borrowing across zero.',
    occurred_at: '2026-08-10T16:45:00Z',
    day_label: 'Aug 10, 2026',
    student_id: null,
    assessment_id: null,
  },
  {
    id: 'act-13',
    type: 'report_exported',
    title: 'Attention list exported',
    description: 'Shared with the head teacher ahead of the Term 1 review.',
    occurred_at: '2026-08-08T12:00:00Z',
    day_label: 'Aug 8, 2026',
    student_id: null,
    assessment_id: null,
  },
  {
    id: 'act-14',
    type: 'assessment_completed',
    title: 'Letter Sounds Practice completed',
    description: '30 of 32 students submitted. Class average 78%.',
    occurred_at: '2026-08-05T11:20:00Z',
    day_label: 'Aug 5, 2026',
    student_id: null,
    assessment_id: 'asm-letter-sounds',
  },
];

/* -------------------------------------------------------------------------- */
/* Class performance                                                          */
/* -------------------------------------------------------------------------- */

const assessedCount = students.filter((student) => student.level !== 'beginner').length;

function share(count: number): number {
  return Math.round((count / assessedCount) * 100);
}

const BAND_LABEL = { strong: 'Strong', intermediate: 'Intermediate', struggling: 'Struggling' };

const distributionSegments = (['strong', 'intermediate', 'struggling'] as const).map((band) => {
  const count = students.filter((student) => student.level === band).length;
  return { band, label: BAND_LABEL[band], students: count, percentage: share(count) };
});

/**
 * Band movement since the baseline. `change` is a headcount delta, not a
 * percentage — the design's "+3" reads as three more children, which is the
 * number a teacher can act on.
 */
export const bandMovement = distributionSegments.map((segment) => ({
  ...segment,
  change: segment.band === 'strong' ? 3 : segment.band === 'intermediate' ? 1 : -4,
}));

export const classPerformance = {
  class_name: CLASS_NAME,
  term_label: TERM_LABEL,
  assessed_count: assessedCount,
  total_students: students.length,
  class_average: 64,
  class_average_change: 6,
  participation_rate: Math.round((assessedCount / students.length) * 100),
  baseline_label: 'Compared with the May 2026 midline',
  movement: bandMovement,
  skills: [
    {
      id: 'skl-letter-recognition',
      skill: 'Letter recognition',
      subject: 'literacy' as const,
      average_score: 84,
      change: 4,
      students_below_benchmark: 3,
    },
    {
      id: 'skl-letter-sounds',
      skill: 'Letter sounds',
      subject: 'literacy' as const,
      average_score: 71,
      change: 2,
      students_below_benchmark: 7,
    },
    {
      id: 'skl-word-reading',
      skill: 'Word reading',
      subject: 'literacy' as const,
      average_score: 52,
      change: -3,
      students_below_benchmark: 9,
    },
    {
      id: 'skl-reading-comprehension',
      skill: 'Reading comprehension',
      subject: 'literacy' as const,
      average_score: 58,
      change: 1,
      students_below_benchmark: 8,
    },
    {
      id: 'skl-listening',
      skill: 'Listening comprehension',
      subject: 'literacy' as const,
      average_score: 70,
      change: 12,
      students_below_benchmark: 4,
    },
    {
      id: 'skl-counting',
      skill: 'Counting and number sense',
      subject: 'numeracy' as const,
      average_score: 81,
      change: 5,
      students_below_benchmark: 4,
    },
    {
      id: 'skl-addition',
      skill: 'Basic addition',
      subject: 'numeracy' as const,
      average_score: 76,
      change: 3,
      students_below_benchmark: 5,
    },
    {
      id: 'skl-subtraction',
      skill: 'Subtraction',
      subject: 'numeracy' as const,
      average_score: 49,
      change: -2,
      students_below_benchmark: 11,
    },
    {
      id: 'skl-place-value',
      skill: 'Place value',
      subject: 'numeracy' as const,
      average_score: 55,
      change: 0,
      students_below_benchmark: 10,
    },
  ],
  trend: [
    {
      id: 'trn-01',
      label: 'Feb baseline',
      average_score: 51,
      participation_rate: 84,
      completed_on: '2026-02-14',
    },
    {
      id: 'trn-02',
      label: 'Apr check',
      average_score: 55,
      participation_rate: 88,
      completed_on: '2026-04-22',
    },
    {
      id: 'trn-03',
      label: 'May midline',
      average_score: 58,
      participation_rate: 91,
      completed_on: '2026-05-20',
    },
    {
      id: 'trn-04',
      label: 'Aug letter sounds',
      average_score: 62,
      participation_rate: 94,
      completed_on: '2026-08-05',
    },
    {
      id: 'trn-05',
      label: 'Aug baseline',
      average_score: 64,
      participation_rate: Math.round((assessedCount / students.length) * 100),
      completed_on: '2026-08-18',
    },
  ],
  most_improved: [
    {
      student_id: 'stu-blessing-eze',
      full_name: 'Blessing Eze',
      from_band: 'struggling' as const,
      to_band: 'intermediate' as const,
      change: 18,
    },
    {
      student_id: 'stu-emeka-nnamdi',
      full_name: 'Emeka Nnamdi',
      from_band: 'struggling' as const,
      to_band: 'intermediate' as const,
      change: 15,
    },
    {
      student_id: 'stu-zainab-idris',
      full_name: 'Zainab Idris',
      from_band: 'intermediate' as const,
      to_band: 'strong' as const,
      change: 12,
    },
    {
      student_id: 'stu-grace-mba',
      full_name: 'Grace Mba',
      from_band: 'intermediate' as const,
      to_band: 'strong' as const,
      change: 9,
    },
  ],
};
