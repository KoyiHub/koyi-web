/**
 * PROVISIONAL seed for Recent Activity and Class Performance.
 *
 * Split out of `teacher-seed.ts` so the roster and the reporting timeline can
 * be read on their own. Both are illustrative; see the security note at the top
 * of `teacher-seed.ts`.
 */

import { CLASS_NAME, students } from './teacher-seed';

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
    title: 'Literacy Baseline completed',
    description: '28 of 32 students submitted. Most placed at Level 2 or 3.',
    occurred_at: '2026-08-18T08:40:00Z',
    day_label: 'Today',
    student_id: null,
    assessment_id: 'asm-literacy-baseline',
  },
  {
    id: 'act-03',
    type: 'student_flagged',
    title: 'Fatima Bello flagged for word reading',
    description: 'Placed at Level 1 for word reading — the next thing to teach her.',
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
    description: 'Literacy Baseline results exported as CSV.',
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
    description: '26 of 32 students submitted. Most placed at Level 3.',
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
    title: 'New insight: listening comprehension improving',
    description:
      'More children are passing listening comprehension at their expected level than at the last check.',
    occurred_at: '2026-08-12T10:00:00Z',
    day_label: 'Aug 12, 2026',
    student_id: null,
    assessment_id: null,
  },
  {
    id: 'act-11',
    type: 'assessment_assigned',
    title: 'Literacy Baseline assigned',
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
    description: 'Shared with the head teacher.',
    occurred_at: '2026-08-08T12:00:00Z',
    day_label: 'Aug 8, 2026',
    student_id: null,
    assessment_id: null,
  },
  {
    id: 'act-14',
    type: 'assessment_completed',
    title: 'Letter Sounds Practice completed',
    description: '30 of 32 students submitted. Most placed at Level 4 or 5.',
    occurred_at: '2026-08-05T11:20:00Z',
    day_label: 'Aug 5, 2026',
    student_id: null,
    assessment_id: 'asm-letter-sounds',
  },
];

/* -------------------------------------------------------------------------- */
/* Class performance — level-first (Phase 7's §9 sweep): no bare percentage, */
/* no strong/weak band, no term framing, literacy and numeracy independent. */
/* -------------------------------------------------------------------------- */

const assessedCount = students.filter((student) => student.level !== 'beginner').length;
const unplacedCount = students.length - assessedCount;

export const classPerformance = {
  class_name: CLASS_NAME,
  measured_since: 'since the last assessment',
  assessed_count: assessedCount,
  total_students: students.length,
  level_distribution: {
    levels: {
      literacy: { '1': 3, '2': 6, '3': 9, '4': 7, '5': 3 },
      numeracy: { '1': 4, '2': 7, '3': 8, '4': 6, '5': 3 },
    },
    unplaced: { literacy: unplacedCount, numeracy: unplacedCount },
  },
  movement: [
    { domain: 'literacy' as const, moved_up: 5, moved_down: 1, unchanged: 20, newly_placed: 2 },
    { domain: 'numeracy' as const, moved_up: 4, moved_down: 2, unchanged: 19, newly_placed: 3 },
  ],
  skills: [
    {
      id: 'skl-letter-recognition',
      skill: 'Letter recognition',
      domain: 'literacy' as const,
      levels: { '1': 2, '2': 3, '3': 5, '4': 10, '5': 8 },
      students_needing_support: 2,
    },
    {
      id: 'skl-letter-sounds',
      skill: 'Letter sounds',
      domain: 'literacy' as const,
      levels: { '1': 3, '2': 4, '3': 8, '4': 9, '5': 4 },
      students_needing_support: 3,
    },
    {
      id: 'skl-word-reading',
      skill: 'Word reading',
      domain: 'literacy' as const,
      levels: { '1': 9, '2': 7, '3': 6, '4': 4, '5': 2 },
      students_needing_support: 9,
    },
    {
      id: 'skl-reading-comprehension',
      skill: 'Reading comprehension',
      domain: 'literacy' as const,
      levels: { '1': 8, '2': 6, '3': 6, '4': 5, '5': 3 },
      students_needing_support: 8,
    },
    {
      id: 'skl-listening',
      skill: 'Listening comprehension',
      domain: 'literacy' as const,
      levels: { '1': 4, '2': 5, '3': 7, '4': 8, '5': 4 },
      students_needing_support: 4,
    },
    {
      id: 'skl-counting',
      skill: 'Counting and number sense',
      domain: 'numeracy' as const,
      levels: { '1': 2, '2': 4, '3': 6, '4': 9, '5': 7 },
      students_needing_support: 2,
    },
    {
      id: 'skl-addition',
      skill: 'Basic addition',
      domain: 'numeracy' as const,
      levels: { '1': 3, '2': 5, '3': 7, '4': 8, '5': 5 },
      students_needing_support: 3,
    },
    {
      id: 'skl-subtraction',
      skill: 'Subtraction',
      domain: 'numeracy' as const,
      levels: { '1': 11, '2': 8, '3': 5, '4': 3, '5': 1 },
      students_needing_support: 11,
    },
    {
      id: 'skl-place-value',
      skill: 'Place value',
      domain: 'numeracy' as const,
      levels: { '1': 10, '2': 8, '3': 5, '4': 3, '5': 2 },
      students_needing_support: 10,
    },
  ],
  most_improved: [
    {
      student_id: 'stu-blessing-eze',
      full_name: 'Blessing Eze',
      domain: 'literacy' as const,
      previous: 1,
      current: 3,
    },
    {
      student_id: 'stu-emeka-nnamdi',
      full_name: 'Emeka Nnamdi',
      domain: 'literacy' as const,
      previous: 2,
      current: 4,
    },
    {
      student_id: 'stu-zainab-idris',
      full_name: 'Zainab Idris',
      domain: 'numeracy' as const,
      previous: 2,
      current: 4,
    },
    {
      student_id: 'stu-grace-mba',
      full_name: 'Grace Mba',
      domain: 'numeracy' as const,
      previous: 3,
      current: 5,
    },
  ],
};
