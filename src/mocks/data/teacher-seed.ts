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

export const bandLabels: Record<LearningLevel, string> = {
  strong: 'Strong',
  intermediate: 'Intermediate',
  struggling: 'Struggling',
  beginner: 'Not yet assessed',
};

/** The signed-in teacher, shown in the dashboard greeting. */
export const TEACHER_NAME = 'Amina Sulaiman';

export interface SeedStudent {
  id: string;
  /** The human-readable id — `frontend-integration.md` §5.6's `student_id`. */
  student_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'female' | 'male';
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

/** Splits "Amina Yusuf" into `{first: "Amina", last: "Yusuf"}` — good enough for a mock. */
function nameParts(fullName: string): { first: string; last: string } {
  const [first, ...rest] = fullName.split(' ');
  return { first: first ?? fullName, last: rest.join(' ') || fullName };
}

/** A plausible date of birth for a child of `age` at the start of the school year. */
function dobFromAge(age: number): string {
  return new Date(Date.UTC(2026 - age, 8, between(1, 28))).toISOString().slice(0, 10);
}

function buildStudents(): SeedStudent[] {
  const list: SeedStudent[] = NAMED_STUDENTS.map((entry, index) => {
    const band = entry.level === 'beginner' ? 'intermediate' : entry.level;
    const [min, max] = BAND_RANGE[band];
    const { first, last } = nameParts(entry.full_name);
    const age = between(8, 10);

    return {
      id: entry.id,
      student_id: `2026-04A-${String(index + 1).padStart(2, '0')}`,
      full_name: entry.full_name,
      first_name: first,
      last_name: last,
      date_of_birth: dobFromAge(age),
      gender: index % 2 === 0 ? 'female' : 'male',
      student_code: `2026-04A-${String(index + 1).padStart(2, '0')}`,
      class_name: CLASS_NAME,
      age,
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
    const { first, last } = nameParts(name);
    const age = between(8, 10);
    const studentId = `2026-04A-${String(NAMED_STUDENTS.length + index + 1).padStart(2, '0')}`;

    list.push({
      id: `stu-${name.toLowerCase().replace(/\s+/g, '-')}`,
      student_id: studentId,
      full_name: name,
      first_name: first,
      last_name: last,
      date_of_birth: dobFromAge(age),
      gender: index % 2 === 0 ? 'female' : 'male',
      student_code: studentId,
      class_name: CLASS_NAME,
      age,
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

const assessedStudents = students.filter((student) => student.level !== 'beginner');
const attentionStudents = students.filter(
  (student) => student.level !== 'beginner' && student.needs_attention,
);

/**
 * `GET /v1/teacher/dashboard/` — `frontend-integration.md` §5.1, matched
 * field-for-field. `attention_count` is exactly `class_distribution.
 * struggling`, not an independent number; there is no trend arrow.
 */
export const dashboard = {
  teacher_name: TEACHER_NAME,
  school_class: CLASS_NAME,
  total_students: students.length,
  assessed_students: assessedStudents.length,
  attention_count: students.filter((student) => student.level === 'struggling').length,
  class_distribution: {
    strong: students.filter((student) => student.level === 'strong').length,
    intermediate: students.filter((student) => student.level === 'intermediate').length,
    struggling: students.filter((student) => student.level === 'struggling').length,
    not_yet_assessed: students.filter((student) => student.level === 'beginner').length,
  },
  insight: {
    domain: 'literacy' as const,
    skill_name: 'Word reading',
    summary:
      'Children who scored below the benchmark on Term 1 Literacy Baseline missed the same kind of item: decoding two-syllable words.',
    // No groups seed exists yet (Phase C) — `null` is the documented common case.
    group_id: null,
  },
  students_needing_attention: attentionStudents.slice(0, 5).map((student) => ({
    student_id: student.id,
    full_name: student.full_name,
    primary_gap: student.primary_gap ?? student.learning_gaps[0] ?? 'Reading comprehension',
    last_assessed_at: student.last_assessed,
  })),
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
      student_ids: attentionStudents.slice(0, 9).map((student) => student.id),
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
