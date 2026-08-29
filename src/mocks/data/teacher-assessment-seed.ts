/**
 * PROVISIONAL assessment seed: the library, one full detail record per
 * assessment, and the analytics report behind it.
 *
 * SECURITY BOUNDARY: scores and bands are pre-computed values on the response,
 * exactly as a real API would return them. No answer key, no `is_correct`, no
 * threshold arithmetic — see `teacher-question-seed.ts`.
 */

import type { AssessmentQuestion } from '@/features/teacher/api/shared.schema';
import type {
  AssessmentDetail,
  AssessmentSummary,
  StudentResult,
} from '@/features/teacher/assessments/api/assessment.schema';

import { bankQuestions, toAssessmentQuestion } from './teacher-question-seed';
import { CLASS_NAME, students } from './teacher-seed';

interface SeedAssessment extends AssessmentSummary {
  /** Questions live on the record so the builder can reopen a draft unchanged. */
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
    status: 'completed',
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
    status: 'completed',
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
    status: 'completed',
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
    status: 'active',
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
    status: 'scheduled',
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
    status: 'active',
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

export function findAssessment(assessmentId: string): SeedAssessment | undefined {
  return assessments.find((assessment) => assessment.id === assessmentId);
}

export const tabCounts = {
  all: assessments.length,
  literacy: assessments.filter((assessment) => assessment.subject === 'literacy').length,
  numeracy: assessments.filter((assessment) => assessment.subject === 'numeracy').length,
  drafts: assessments.filter((assessment) => assessment.status === 'draft').length,
};

/* -------------------------------------------------------------------------- */
/* Results                                                                    */
/* -------------------------------------------------------------------------- */

const BAND_GUIDANCE = {
  strong: 'Ready for stretch work. Pair them with children who need a reading partner.',
  intermediate: 'Secure on most items. One targeted skill each would move them up a band.',
  struggling: 'Needs direct teaching on the flagged skill before the next topic starts.',
} as const;

/**
 * Results are deterministic: each child's score is their band score nudged by
 * the assessment, so the same child looks consistent across screens.
 */
function buildResults(assessment: SeedAssessment): StudentResult[] {
  const completed = assessment.completed_count;

  return students.map((student, index) => {
    if (assessment.status === 'draft' || index >= completed) {
      const inProgress = assessment.status === 'active' && index < completed + 3;
      return {
        student_id: student.id,
        full_name: student.full_name,
        student_code: student.student_code,
        status: inProgress ? ('in_progress' as const) : ('not_started' as const),
        score: null,
        band: null,
        correct_label: null,
        time_taken_label: null,
        submitted_at: null,
      };
    }

    const base = student.latest_score ?? 55;
    const nudge = assessment.subject === 'numeracy' ? 4 : -2;
    const score = Math.max(8, Math.min(98, base + nudge + ((index % 5) - 2) * 3));
    const band = score >= 75 ? 'strong' : score >= 50 ? 'intermediate' : 'struggling';
    const correct = Math.round((score / 100) * assessment.question_count);
    const minutes = 9 + (index % 7);

    return {
      student_id: student.id,
      full_name: student.full_name,
      student_code: student.student_code,
      status: 'completed' as const,
      score,
      band: band,
      correct_label: `${String(correct)} of ${String(assessment.question_count)}`,
      time_taken_label: `${String(minutes)} min`,
      submitted_at: assessment.updated_at,
    };
  });
}

const SKILLS_BY_SUBJECT = {
  literacy: [
    { id: 'dsk-letter-recognition', skill: 'Letter recognition', average_score: 84, below: 3 },
    { id: 'dsk-letter-sounds', skill: 'Letter sounds', average_score: 71, below: 7 },
    { id: 'dsk-word-reading', skill: 'Word reading', average_score: 52, below: 9 },
    { id: 'dsk-comprehension', skill: 'Reading comprehension', average_score: 58, below: 8 },
  ],
  numeracy: [
    { id: 'dsk-counting', skill: 'Counting and number sense', average_score: 81, below: 4 },
    { id: 'dsk-addition', skill: 'Basic addition', average_score: 76, below: 5 },
    { id: 'dsk-subtraction', skill: 'Subtraction', average_score: 49, below: 11 },
    { id: 'dsk-place-value', skill: 'Place value', average_score: 55, below: 10 },
  ],
} as const;

export function buildDetail(assessment: SeedAssessment): AssessmentDetail {
  const results = buildResults(assessment);
  const completedResults = results.filter((result) => result.status === 'completed');
  const average =
    completedResults.length === 0
      ? 0
      : Math.round(
          completedResults.reduce((total, result) => total + (result.score ?? 0), 0) /
            completedResults.length,
        );

  const bandCount = (band: 'strong' | 'intermediate' | 'struggling') =>
    completedResults.filter((result) => result.band === band).length;

  const share = (count: number) =>
    completedResults.length === 0 ? 0 : Math.round((count / completedResults.length) * 100);

  const scheduled = assessment.status === 'draft' ? null : '2026-08-11T08:00:00Z';
  const deadline = assessment.status === 'draft' ? null : '2026-08-18T16:00:00Z';

  return {
    id: assessment.id,
    title: assessment.title,
    description: assessment.description,
    subject: assessment.subject,
    assessment_type: assessment.assessment_type,
    status: assessment.status,
    difficulty: assessment.difficulty,
    grade_label: assessment.grade_label,
    class_name: CLASS_NAME,
    question_count: assessment.question_count,
    total_points: assessment.questions.reduce((total, question) => total + question.point, 0),
    time_limit_minutes: assessment.time_limit_minutes,
    scheduled_for: scheduled,
    deadline,
    window_label: assessment.status === 'draft' ? null : 'Aug 11, 8:00 AM — Aug 18, 4:00 PM',
    metrics: {
      class_average: average,
      class_average_change: assessment.subject === 'numeracy' ? 3 : 6,
      completion_rate: Math.round(
        (assessment.completed_count / (assessment.assigned_count || 1)) * 100,
      ),
      completed_count: assessment.completed_count,
      assigned_count: assessment.assigned_count,
      average_time_label: assessment.time_limit_minutes
        ? `${String(Math.round(assessment.time_limit_minutes * 0.6))} min`
        : '12 min',
      needs_attention: bandCount('struggling'),
    },
    skills: SKILLS_BY_SUBJECT[assessment.subject].map((skill) => ({
      id: `${assessment.id}-${skill.id}`,
      skill: skill.skill,
      average_score: skill.average_score,
      students_below_benchmark: skill.below,
    })),
    learning_levels: (['strong', 'intermediate', 'struggling'] as const).map((band) => ({
      band,
      label: band === 'strong' ? 'Strong' : band === 'intermediate' ? 'Intermediate' : 'Struggling',
      students: bandCount(band),
      percentage: share(bandCount(band)),
      guidance: BAND_GUIDANCE[band],
    })),
    results,
  };
}

/* -------------------------------------------------------------------------- */
/* Analytics                                                                  */
/* -------------------------------------------------------------------------- */

const MOST_MISSED_BY_SUBJECT = {
  literacy: [
    {
      skill: 'Word reading',
      miss_rate: 61,
      common_error: 'Children read the first syllable and guessed the rest of the word.',
    },
    {
      skill: 'Reading comprehension',
      miss_rate: 46,
      common_error: 'Answers repeated a phrase from the passage instead of answering the question.',
    },
    {
      skill: 'Letter sounds',
      miss_rate: 32,
      common_error: 'Confusion between the m and n sounds when played back-to-back.',
    },
  ],
  numeracy: [
    {
      skill: 'Subtraction',
      miss_rate: 58,
      common_error: 'Borrowing was skipped whenever a zero sat in the tens column.',
    },
    {
      skill: 'Place value',
      miss_rate: 44,
      common_error: 'Tens and hundreds columns were read in the wrong order.',
    },
    {
      skill: 'Basic addition',
      miss_rate: 21,
      common_error: 'Carrying was dropped on three-digit sums.',
    },
  ],
} as const;

export function buildAnalytics(assessment: SeedAssessment) {
  const detail = buildDetail(assessment);
  const completed = detail.results.filter((result) => result.status === 'completed');

  const buckets = [
    { id: 'bkt-1', label: '0–20%', min: 0, max: 20, band: 'struggling' as const },
    { id: 'bkt-2', label: '21–40%', min: 21, max: 40, band: 'struggling' as const },
    { id: 'bkt-3', label: '41–60%', min: 41, max: 60, band: 'intermediate' as const },
    { id: 'bkt-4', label: '61–80%', min: 61, max: 80, band: 'intermediate' as const },
    { id: 'bkt-5', label: '81–100%', min: 81, max: 100, band: 'strong' as const },
  ];

  return {
    id: assessment.id,
    title: assessment.title,
    class_name: CLASS_NAME,
    completed_label: assessment.updated_label,
    class_average: detail.metrics.class_average,
    class_average_change: detail.metrics.class_average_change,
    class_average_caption: `Up ${String(detail.metrics.class_average_change)} points on the May midline`,
    participation_rate: detail.metrics.completion_rate,
    participation_caption: `${String(assessment.completed_count)} of ${String(assessment.assigned_count)} students submitted`,
    score_distribution: buckets.map((bucket) => {
      const count = completed.filter(
        (result) => (result.score ?? 0) >= bucket.min && (result.score ?? 0) <= bucket.max,
      ).length;

      return {
        id: `${assessment.id}-${bucket.id}`,
        label: bucket.label,
        students: count,
        percentage: completed.length === 0 ? 0 : Math.round((count / completed.length) * 100),
        band: bucket.band,
      };
    }),
    skill_performance: detail.skills.map((skill, index) => ({
      id: skill.id,
      skill: skill.skill,
      average_score: skill.average_score,
      change: [4, 2, -3, 1][index] ?? 0,
    })),
    most_missed: MOST_MISSED_BY_SUBJECT[assessment.subject].map((entry, index) => {
      const question = assessment.questions[index] ?? assessment.questions[0];

      return {
        question_id: question?.id ?? `${assessment.id}-q${String(index + 1)}`,
        order: index + 1,
        text: question?.text ?? entry.skill,
        question_type: question?.question_type ?? ('single_choice' as const),
        skill: entry.skill,
        miss_rate: entry.miss_rate,
        common_error: entry.common_error,
      };
    }),
    trends: [
      {
        id: `${assessment.id}-trend-1`,
        tone: 'action' as const,
        headline:
          assessment.subject === 'literacy'
            ? 'Decoding is the bottleneck, not understanding'
            : 'Borrowing across zero is the single biggest loss',
        body:
          assessment.subject === 'literacy'
            ? 'Children who scored low on word reading scored 15 points higher on listening comprehension. Teach decoding, not comprehension, to move this group.'
            : 'Items without a zero in the tens column were answered correctly by almost everyone. Reteach borrowing before the next topic.',
      },
      {
        id: `${assessment.id}-trend-2`,
        tone: 'watch' as const,
        headline: 'Four children did not sit this assessment',
        body: 'Their last recorded result is from the May midline. Reassign before the term report.',
      },
      {
        id: `${assessment.id}-trend-3`,
        tone: 'positive' as const,
        headline: `Class average is up ${String(detail.metrics.class_average_change)} points`,
        body: 'No child scored lower than they did on the previous comparable assessment.',
      },
    ],
  };
}
