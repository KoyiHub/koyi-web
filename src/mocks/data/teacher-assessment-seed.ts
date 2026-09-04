/**
 * LEGACY assessment seed — kept only for `teacher-student-seed.ts`'s question
 * log demo data, which still reads the old shape (`subject`, `question_type`,
 * a plain `status` string) rather than the new contract.
 *
 * This is intentionally disconnected from the live `/v1/teacher/assessments/`
 * handlers, which are answered by `@/mocks/data/assessment-seed` against the
 * real contract now — see `frontend-integration.md` §5.3. Rebuilding the
 * student profile screen onto that contract (Phase 4 of the refactor) removes
 * this file; until then it is a closed, self-contained fixture.
 */

import type { AssessmentQuestion } from '@/features/teacher/api/shared.schema';

import { bankQuestions, toAssessmentQuestion } from './teacher-question-seed';

interface SeedAssessment {
  id: string;
  title: string;
  description: string;
  subject: 'literacy' | 'numeracy';
  assessment_type: 'baseline' | 'midline' | 'endline' | 'practice';
  status: 'draft' | 'published' | 'open' | 'closed';
  difficulty: 'foundation' | 'core' | 'stretch';
  grade_label: string;
  grade_level: number;
  question_count: number;
  time_limit_minutes: number | null;
  assigned_count: number;
  completed_count: number;
  updated_at: string;
  updated_label: string;
  /** Questions live on the record so the log can quote what a child was asked. */
  questions: AssessmentQuestion[];
}

function questionsFor(references: string[]): AssessmentQuestion[] {
  return references
    .map((reference) => bankQuestions.find((question) => question.reference === reference))
    .filter((question): question is (typeof bankQuestions)[number] => question !== undefined)
    .map((question, index) => toAssessmentQuestion(question, index + 1));
}

const LITERACY_REFS = [
  'KOYI-1042',
  'KOYI-1043',
  'KOYI-1044',
  'KOYI-1045',
  'KOYI-1046',
  'KOYI-1048',
];
const NUMERACY_REFS = [
  'KOYI-1050',
  'KOYI-1051',
  'KOYI-1052',
  'KOYI-1053',
  'KOYI-1055',
  'KOYI-1056',
];

export const assessments: SeedAssessment[] = [
  {
    id: 'asm-literacy-baseline',
    title: 'Term 1 Literacy Baseline',
    description:
      'Where every child stands on letter sounds, word reading and comprehension at the start of the term.',
    subject: 'literacy',
    assessment_type: 'baseline',
    status: 'closed',
    difficulty: 'core',
    grade_label: 'Primary 4',
    grade_level: 4,
    question_count: 6,
    time_limit_minutes: 30,
    assigned_count: 32,
    completed_count: 28,
    updated_at: '2026-08-18T08:40:00Z',
    updated_label: 'Completed Aug 18, 2026',
    questions: questionsFor(LITERACY_REFS),
  },
  {
    id: 'asm-numeracy-check',
    title: 'Numeracy Progress Check',
    description:
      'A short check on addition, subtraction and place value after the first six weeks.',
    subject: 'numeracy',
    assessment_type: 'midline',
    status: 'closed',
    difficulty: 'core',
    grade_label: 'Primary 4',
    grade_level: 4,
    question_count: 6,
    time_limit_minutes: 25,
    assigned_count: 32,
    completed_count: 26,
    updated_at: '2026-08-14T14:10:00Z',
    updated_label: 'Completed Aug 14, 2026',
    questions: questionsFor(NUMERACY_REFS),
  },
  {
    id: 'asm-letter-sounds',
    title: 'Letter Sounds Practice',
    description: 'Ten quick listening items. Untimed, and children may replay each sound twice.',
    subject: 'literacy',
    assessment_type: 'practice',
    status: 'closed',
    difficulty: 'foundation',
    grade_label: 'Primary 3',
    grade_level: 3,
    question_count: 4,
    time_limit_minutes: null,
    assigned_count: 32,
    completed_count: 30,
    updated_at: '2026-08-05T11:20:00Z',
    updated_label: 'Completed Aug 5, 2026',
    questions: questionsFor(['KOYI-1043', 'KOYI-1046', 'KOYI-1048', 'KOYI-1042']),
  },
  {
    id: 'asm-reading-fluency',
    title: 'Reading Fluency Check',
    description: 'Spoken responses to picture and passage prompts. Best run one child at a time.',
    subject: 'literacy',
    assessment_type: 'practice',
    status: 'open',
    difficulty: 'stretch',
    grade_label: 'Primary 4',
    grade_level: 4,
    question_count: 3,
    time_limit_minutes: 20,
    assigned_count: 12,
    completed_count: 5,
    updated_at: '2026-08-19T07:30:00Z',
    updated_label: 'Open until Aug 26, 2026',
    questions: questionsFor(['KOYI-1045', 'KOYI-1044', 'KOYI-1049']),
  },
  {
    id: 'asm-subtraction-focus',
    title: 'Subtraction Focus Set',
    description:
      'Built for the borrowing-across-zero group. Six items, all on the same misconception.',
    subject: 'numeracy',
    assessment_type: 'practice',
    status: 'published',
    difficulty: 'core',
    grade_label: 'Primary 4',
    grade_level: 4,
    question_count: 3,
    time_limit_minutes: 15,
    assigned_count: 11,
    completed_count: 0,
    updated_at: '2026-08-20T09:00:00Z',
    updated_label: 'Opens Aug 24, 2026',
    questions: questionsFor(['KOYI-1051', 'KOYI-1052', 'KOYI-1056']),
  },
  {
    id: 'asm-endline-literacy',
    title: 'Term 1 Literacy Endline',
    description: 'The end-of-term comparison against the August baseline. Not yet scheduled.',
    subject: 'literacy',
    assessment_type: 'endline',
    status: 'draft',
    difficulty: 'core',
    grade_label: 'Primary 4',
    grade_level: 4,
    question_count: 4,
    time_limit_minutes: 30,
    assigned_count: 0,
    completed_count: 0,
    updated_at: '2026-08-20T15:12:00Z',
    updated_label: 'Draft · edited Aug 20, 2026',
    questions: questionsFor(['KOYI-1042', 'KOYI-1044', 'KOYI-1047', 'KOYI-1045']),
  },
  {
    id: 'asm-place-value-draft',
    title: 'Place Value Diagnostic',
    description: 'Half built. Needs two more items before it is worth assigning.',
    subject: 'numeracy',
    assessment_type: 'practice',
    status: 'draft',
    difficulty: 'foundation',
    grade_label: 'Primary 4',
    grade_level: 4,
    question_count: 2,
    time_limit_minutes: null,
    assigned_count: 0,
    completed_count: 0,
    updated_at: '2026-08-21T10:05:00Z',
    updated_label: 'Draft · edited Aug 21, 2026',
    questions: questionsFor(['KOYI-1053', 'KOYI-1050']),
  },
  {
    id: 'asm-counting-warmup',
    title: 'Counting Warm-Up',
    description: 'Five-minute starter for Monday mornings. Reusable every week.',
    subject: 'numeracy',
    assessment_type: 'practice',
    status: 'open',
    difficulty: 'foundation',
    grade_label: 'Primary 3',
    grade_level: 3,
    question_count: 3,
    time_limit_minutes: 5,
    assigned_count: 32,
    completed_count: 19,
    updated_at: '2026-08-19T06:45:00Z',
    updated_label: 'Open until Aug 29, 2026',
    questions: questionsFor(['KOYI-1050', 'KOYI-1056', 'KOYI-1055']),
  },
  {
    id: 'asm-comprehension-stretch',
    title: 'Comprehension Stretch',
    description: 'Longer passages for the children who finished the baseline early.',
    subject: 'literacy',
    assessment_type: 'practice',
    status: 'draft',
    difficulty: 'stretch',
    grade_label: 'Primary 4',
    grade_level: 4,
    question_count: 2,
    time_limit_minutes: 25,
    assigned_count: 0,
    completed_count: 0,
    updated_at: '2026-08-22T08:00:00Z',
    updated_label: 'Draft · edited Aug 22, 2026',
    questions: questionsFor(['KOYI-1044', 'KOYI-1047']),
  },
];
