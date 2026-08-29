/**
 * PROVISIONAL in-memory database for the Teacher application.
 *
 * No Teacher endpoints are confirmed on the Django side — the backend ships
 * `apps.common` and `apps.users` only. Every Teacher screen is therefore
 * served by MSW through the same query interface a real API would use, so
 * moving to Django is a base-path change in `features/teacher/api/endpoints.ts`
 * and nothing else.
 *
 * Shapes follow Django/DRF conventions — snake_case fields, string ids, ISO
 * timestamps, `{ count, results }` envelopes — so the Zod response schemas
 * that parse them should survive the switch.
 *
 * Figures come from a fixed seed: the same class appears on every reload and
 * in every test run. They are illustrative only. FLN band labels
 * (strong / intermediate / struggling) are presentation values carried on the
 * response — the real thresholds are unconfirmed and are never computed here
 * or in any component.
 *
 * SECURITY BOUNDARY: nothing in this file, or in the question seed beside it,
 * carries a correct answer, an `is_correct` flag or a scoring rule. The
 * student assessment app runs in the same browser.
 */

/** Deterministic PRNG (mulberry32) — same seed, same class, every run. */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return function random(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createRandom(20260828);

function between(min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1));
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(random() * items.length)] as T;
}

export type PerformanceBand = 'strong' | 'intermediate' | 'struggling';
export type LearningLevel = PerformanceBand | 'beginner';

export const CLASS_NAME = 'Primary 4 — Class A';
export const TERM_LABEL = 'Term 1 · 2026/2027';
export const SCHOOL_NAME = 'Bright Future Primary School';

export const bandLabels: Record<LearningLevel, string> = {
  strong: 'Strong',
  intermediate: 'Intermediate',
  struggling: 'Struggling',
  beginner: 'Not yet assessed',
};

/**
 * The signed-in teacher. `short_name` is what the dashboard greeting uses, so
 * the greeting never has to slice a full name apart in the browser.
 */
export const teacherProfile = {
  id: 'tch-amina-sulaiman',
  full_name: 'Amina Sulaiman',
  title: 'Mrs.',
  short_name: 'Amina',
  email: 'amina.sulaiman@brightfuture.ng',
  avatar_url: null,
  school_name: SCHOOL_NAME,
  class_name: CLASS_NAME,
  student_count: 32,
};

export interface SeedStudent {
  id: string;
  full_name: string;
  student_code: string;
  class_name: string;
  age: number;
  level: LearningLevel;
  avatar_url: string | null;
  latest_score: number | null;
  last_assessed: string | null;
  last_assessed_label: string;
  primary_gap: string | null;
  needs_attention: boolean;
  strengths: string[];
  learning_gaps: string[];
}

/**
 * Named children come first so the eight students the earlier fixtures used
 * keep their identities, gaps and bands — the design walkthroughs and the
 * existing Groups screens both refer to them by name.
 */
const NAMED_STUDENTS: {
  id: string;
  full_name: string;
  level: LearningLevel;
  primary_gap: string | null;
  strengths: string[];
  learning_gaps: string[];
}[] = [
  {
    id: 'stu-amina-yusuf',
    full_name: 'Amina Yusuf',
    level: 'intermediate',
    primary_gap: 'Reading comprehension',
    strengths: ['Letter recognition', 'Basic addition'],
    learning_gaps: ['Word reading', 'Reading comprehension', 'Subtraction'],
  },
  {
    id: 'stu-chinedu-okafor',
    full_name: 'Chinedu Okafor',
    level: 'strong',
    primary_gap: null,
    strengths: ['Letter recognition', 'Reading comprehension', 'Basic addition'],
    learning_gaps: ['Subtraction'],
  },
  {
    id: 'stu-fatima-bello',
    full_name: 'Fatima Bello',
    level: 'struggling',
    primary_gap: 'Word reading',
    strengths: ['Listening comprehension'],
    learning_gaps: ['Word reading', 'Letter sounds', 'Basic addition'],
  },
  {
    id: 'stu-zainab-idris',
    full_name: 'Zainab Idris',
    level: 'strong',
    primary_gap: null,
    strengths: ['Word reading', 'Number sense'],
    learning_gaps: ['Place value'],
  },
  {
    id: 'stu-emeka-nnamdi',
    full_name: 'Emeka Nnamdi',
    level: 'intermediate',
    primary_gap: 'Place value',
    strengths: ['Letter sounds', 'Counting'],
    learning_gaps: ['Place value', 'Reading comprehension'],
  },
  {
    id: 'stu-samuel-ojo',
    full_name: 'Samuel Ojo',
    level: 'struggling',
    primary_gap: 'Subtraction',
    strengths: ['Letter recognition'],
    learning_gaps: ['Subtraction', 'Place value', 'Word reading'],
  },
  {
    id: 'stu-grace-mba',
    full_name: 'Grace Mba',
    level: 'strong',
    primary_gap: null,
    strengths: ['Reading comprehension', 'Subtraction'],
    learning_gaps: [],
  },
  {
    id: 'stu-blessing-eze',
    full_name: 'Blessing Eze',
    level: 'intermediate',
    primary_gap: 'Letter sounds',
    strengths: ['Counting', 'Basic addition'],
    learning_gaps: ['Letter sounds', 'Word reading'],
  },
];

const FILLER_NAMES = [
  'Ibrahim Danladi',
  'Ngozi Adeyemi',
  'Musa Garba',
  'Chiamaka Obi',
  'Tunde Alabi',
  'Halima Sani',
  'Kelechi Nwosu',
  'Aisha Mohammed',
  'Segun Adeleke',
  'Rukayat Lawal',
  'Obinna Eze',
  'Maryam Abubakar',
  'Femi Ogundele',
  'Chidera Anyanwu',
  'Yusuf Aliyu',
  'Temitope Bakare',
  'Nkiru Chukwu',
  'Abdul Rahman',
  'Bisi Ojo',
  'Hauwa Usman',
  'Daniel Etim',
  'Precious Okonkwo',
  'Suleiman Bala',
  'Folake Adebayo',
];

const GAP_POOL = [
  'Word reading',
  'Reading comprehension',
  'Letter sounds',
  'Subtraction',
  'Place value',
  'Basic addition',
];

const STRENGTH_POOL = [
  'Letter recognition',
  'Listening comprehension',
  'Counting',
  'Number sense',
  'Basic addition',
  'Word reading',
];

const LAST_ASSESSED = '2026-08-18';
const LAST_ASSESSED_LABEL = 'Aug 18, 2026';

/** Score ranges per band. Illustrative only — the real thresholds are unconfirmed. */
const BAND_RANGE: Record<PerformanceBand, [number, number]> = {
  strong: [78, 94],
  intermediate: [55, 74],
  struggling: [28, 49],
};

function buildStudents(): SeedStudent[] {
  const list: SeedStudent[] = NAMED_STUDENTS.map((entry, index) => {
    const band = entry.level === 'beginner' ? 'intermediate' : entry.level;
    const [min, max] = BAND_RANGE[band];

    return {
      id: entry.id,
      full_name: entry.full_name,
      student_code: `2026-04A-${String(index + 1).padStart(2, '0')}`,
      class_name: CLASS_NAME,
      age: between(8, 10),
      level: entry.level,
      avatar_url: null,
      latest_score: between(min, max),
      last_assessed: LAST_ASSESSED,
      last_assessed_label: LAST_ASSESSED_LABEL,
      primary_gap: entry.primary_gap,
      needs_attention: entry.level === 'struggling' || entry.primary_gap !== null,
      strengths: entry.strengths,
      learning_gaps: entry.learning_gaps,
    };
  });

  FILLER_NAMES.forEach((name, index) => {
    // Four children have no completed assessment yet: 32 enrolled, 28 assessed.
    const notAssessed = index >= FILLER_NAMES.length - 4;
    const level: LearningLevel = notAssessed
      ? 'beginner'
      : pick(['strong', 'intermediate', 'intermediate', 'struggling'] as const);
    const gap = level === 'strong' || notAssessed ? null : pick(GAP_POOL);
    const [min, max] = level === 'beginner' ? [0, 0] : BAND_RANGE[level];

    list.push({
      id: `stu-${name.toLowerCase().replace(/\s+/g, '-')}`,
      full_name: name,
      student_code: `2026-04A-${String(NAMED_STUDENTS.length + index + 1).padStart(2, '0')}`,
      class_name: CLASS_NAME,
      age: between(8, 10),
      level,
      avatar_url: null,
      latest_score: notAssessed ? null : between(min, max),
      last_assessed: notAssessed ? null : LAST_ASSESSED,
      last_assessed_label: notAssessed ? 'Not yet assessed' : LAST_ASSESSED_LABEL,
      primary_gap: gap,
      needs_attention: level === 'struggling' || gap !== null,
      strengths: notAssessed ? [] : [pick(STRENGTH_POOL)],
      learning_gaps: gap ? [gap] : [],
    });
  });

  return list;
}

export const students: SeedStudent[] = buildStudents();

export function findStudent(studentId: string): SeedStudent | undefined {
  return students.find((student) => student.id === studentId);
}

export const levelCounts = {
  all: students.length,
  strong: students.filter((student) => student.level === 'strong').length,
  intermediate: students.filter((student) => student.level === 'intermediate').length,
  struggling: students.filter((student) => student.level === 'struggling').length,
  beginner: students.filter((student) => student.level === 'beginner').length,
};

const assessedStudents = students.filter((student) => student.level !== 'beginner');
const attentionStudents = students.filter(
  (student) => student.level !== 'beginner' && student.needs_attention,
);

/** Priority is a server judgement in production; here it follows the band. */
function priorityFor(student: SeedStudent): 'high' | 'medium' | 'low' {
  if (student.level === 'struggling') return 'high';
  if (student.learning_gaps.length > 1) return 'medium';
  return 'low';
}

const ACTIONS: Record<string, string> = {
  'Word reading': 'Run a 10-minute decoding drill daily this week',
  'Reading comprehension': 'Pair with a strong reader for guided retelling',
  'Letter sounds': 'Revisit blending with the phonics card set',
  Subtraction: 'Reteach borrowing with counters before the next topic',
  'Place value': 'Use the base-ten blocks in Monday’s numeracy block',
  'Basic addition': 'Practise number bonds to 20 in the warm-up',
};

export const attentionRows = attentionStudents.map((student) => {
  const issue = student.primary_gap ?? student.learning_gaps[0] ?? 'Reading comprehension';

  return {
    student_id: student.id,
    full_name: student.full_name,
    student_code: student.student_code,
    priority: priorityFor(student),
    identified_issue: issue,
    subject:
      issue === 'Subtraction' || issue === 'Place value' || issue === 'Basic addition'
        ? 'numeracy'
        : 'literacy',
    last_assessment: student.last_assessed ?? LAST_ASSESSED,
    last_assessment_label: student.last_assessed_label,
    recommended_action: ACTIONS[issue] ?? 'Review with a small focus group this week',
  };
});

const strongCount = students.filter((student) => student.level === 'strong').length;
const intermediateCount = students.filter((student) => student.level === 'intermediate').length;
const strugglingCount = students.filter((student) => student.level === 'struggling').length;

function share(count: number): number {
  return Math.round((count / assessedStudents.length) * 100);
}

export const distributionSegments = [
  {
    band: 'strong' as const,
    label: 'Strong',
    students: strongCount,
    percentage: share(strongCount),
  },
  {
    band: 'intermediate' as const,
    label: 'Intermediate',
    students: intermediateCount,
    percentage: share(intermediateCount),
  },
  {
    band: 'struggling' as const,
    label: 'Struggling',
    students: strugglingCount,
    percentage: share(strugglingCount),
  },
];

export const dashboard = {
  class_name: CLASS_NAME,
  term_label: TERM_LABEL,
  time_of_day: 'morning' as const,
  stats: {
    total_students: {
      value: students.length,
      delta_label: '2 joined this term',
      delta_direction: 'up' as const,
    },
    assessed: {
      value: assessedStudents.length,
      delta_label: `${String(students.length - assessedStudents.length)} still to sit Term 1 baseline`,
      delta_direction: 'flat' as const,
    },
    needs_attention: {
      value: attentionStudents.length,
      delta_label: '2 fewer than last week',
      delta_direction: 'down' as const,
    },
  },
  distribution: {
    assessed_count: assessedStudents.length,
    updated_label: `Updated ${LAST_ASSESSED_LABEL}`,
    segments: distributionSegments,
  },
  ai_insight: {
    id: 'ins-emerging-gap',
    headline: 'Word reading is holding a third of the class back',
    body: 'Children who scored below the benchmark on Term 1 Literacy Baseline missed the same kind of item: decoding two-syllable words. Their comprehension scores are higher than their decoding scores, which usually means the words, not the meaning, are the obstacle.',
    focus_skill: 'Word reading',
    affected_students: 9,
  },
  attention: {
    total: attentionStudents.length,
    rows: attentionRows.slice(0, 4),
  },
};

export const insights = {
  generated_label: `Generated ${LAST_ASSESSED_LABEL}, after Term 1 Literacy Baseline`,
  insights: [
    {
      id: 'ins-emerging-gap',
      kind: 'emerging_gap' as const,
      headline: 'Word reading is holding a third of the class back',
      body: 'Nine children scored below the benchmark on decoding while scoring at or above it on listening comprehension. The gap is in reading the words, not understanding them.',
      scope_label: '9 students',
      points: [
        'All nine missed at least three two-syllable decoding items',
        'The same nine scored 15 points higher on listening comprehension',
        'Six of them are already on the attention list for a related gap',
      ],
      focus_skill: 'Word reading',
      student_ids: attentionRows.slice(0, 9).map((row) => row.student_id),
      generated_at: '2026-08-18T09:12:00Z',
    },
    {
      id: 'ins-common-mistake',
      kind: 'common_mistake' as const,
      headline: 'Subtraction errors cluster on borrowing across zero',
      body: 'On the numeracy baseline, wrong answers to subtraction items were not spread evenly. Almost all of them involved a zero in the tens column.',
      scope_label: '11 students',
      points: [
        'Items without a zero were answered correctly by 26 of 28 children',
        'Items with a zero dropped to 17 of 28',
        'The pattern is the same in both Primary 4 streams',
      ],
      focus_skill: 'Subtraction',
      student_ids: ['stu-samuel-ojo', 'stu-amina-yusuf', 'stu-emeka-nnamdi'],
      generated_at: '2026-08-18T09:12:00Z',
    },
    {
      id: 'ins-teaching-activity',
      kind: 'teaching_activity' as const,
      headline: 'Try a 15-minute paired decoding routine',
      body: 'Pair each child in the focus group with a strong reader. The stronger reader reads a two-syllable word aloud, the partner claps the syllables, then reads it back. Fifteen minutes, three times a week.',
      scope_label: 'Whole class, 15 min',
      points: [
        'Needs no printed material beyond the Term 1 word list',
        'Works with the existing Monday and Thursday literacy blocks',
        'Re-assess with a 10-item decoding check in two weeks',
      ],
      focus_skill: 'Word reading',
      student_ids: [],
      generated_at: '2026-08-18T09:12:00Z',
    },
    {
      id: 'ins-positive-trend',
      kind: 'positive_trend' as const,
      headline: 'Listening comprehension is up 12 points since May',
      body: 'The class average on listening comprehension rose from 58 to 70 between the May midline and the August baseline. No child scored lower than they did in May.',
      scope_label: '28 students assessed',
      points: [
        'Largest single-skill gain this term',
        'Five children moved from struggling to intermediate on this skill alone',
        'Worth keeping the daily read-aloud that started in May',
      ],
      focus_skill: null,
      student_ids: [],
      generated_at: '2026-08-18T09:12:00Z',
    },
  ],
};
