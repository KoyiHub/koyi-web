/**
 * PROVISIONAL in-memory database for the School Admin application.
 *
 * Shapes here follow `frontend-integration.md` §4 exactly — snake_case
 * fields, string ids, ISO timestamps, the page-number list envelope from §2
 * (the activity feed is the one cursor-paginated exception, handled
 * separately in `school-admin-handlers.ts`; grades/sessions/classes are the
 * unpaginated exceptions, bare arrays). Every School Admin screen is served
 * by MSW through the same query/mutation interface a real API would use, so
 * moving to Django is a base-path change in each feature's `endpoints.ts`
 * and nothing else.
 *
 * Figures are generated from a fixed seed: the same school appears on every
 * reload and in every test run, which keeps assertions stable. FLN levels
 * (1-5 per domain, independent — §9) are illustrative only, computed here
 * rather than derived from real sittings.
 */

/** Deterministic PRNG (mulberry32) — same seed, same school, every run. */
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

const random = createRandom(20260826);

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(random() * items.length)] as T;
}

function between(min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1));
}

export type FlnLevel = 1 | 2 | 3 | 4 | 5;
export type AssessmentStatus = 'draft' | 'published' | 'closed';
export type AssignmentStatus = 'not_started' | 'in_progress' | 'finished' | 'graded';

export interface SeedSession {
  id: string;
  start_year: number;
  end_year: number;
  label: string;
}

export interface SeedSchool {
  id: string;
  name: string;
  /** 2-12 uppercase letters/digits. Immutable after registration. */
  abbreviation: string;
  email: string;
  class_system: 'primary' | 'grade';
  current_session_id: string;
}

export interface SeedGrade {
  id: string;
  name: string;
}

export interface SeedClass {
  id: string;
  grade_id: string;
  grade_name: string;
  name: string;
  label: string;
}

export interface SeedTeacher {
  id: string;
  teacher_id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  class_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeedAssessment {
  id: string;
  name: string;
  code: string;
  status: AssessmentStatus;
  created_by: string | null;
  opens_at: string | null;
  closes_at: string | null;
  assigned_count: number;
  graded_count: number;
  created_at: string;
}

export interface SeedRecentResult {
  assessment: string;
  date: string;
  percentage: string;
  status: AssignmentStatus;
}

/** `null` — the student has not sat anything yet; the `/fln/` endpoint 404s. */
export interface SeedStudentFln {
  literacy_level: FlnLevel;
  numeracy_level: FlnLevel;
  last_assessed_at: string;
  recent_results: SeedRecentResult[];
}

export interface SeedStudent {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  date_of_birth: string;
  gender: 'female' | 'male';
  class_id: string | null;
  is_active: boolean;
  guardian_name: string;
  guardian_phone_number: string;
  /** Optional — many guardians won't have one. Where an assessment link is sent. */
  guardian_email: string | null;
  guardian_relationship: string;
  created_at: string;
  updated_at: string;
  fln: SeedStudentFln | null;
}

const FIRST_NAMES_FEMALE = [
  'Amina',
  'Chiamaka',
  'Fatima',
  'Halima',
  'Ngozi',
  'Blessing',
  'Aisha',
  'Grace',
  'Zainab',
  'Titi',
  'Kemi',
  'Ronke',
  'Adaeze',
  'Chioma',
  'Sharon',
  'Esther',
  'Hauwa',
  'Ifeoma',
  'Yetunde',
  'Nneka',
];

const FIRST_NAMES_MALE = [
  'David',
  'Emeka',
  'Ibrahim',
  'Samuel',
  'Tunde',
  'Musa',
  'Segun',
  'Uche',
  'Yusuf',
  'Peter',
  'Bello',
  'Samson',
  'Ayo',
  'Chidi',
  'Kunle',
  'Abdul',
  'Femi',
  'Obinna',
  'Danjuma',
  'Bashir',
];

const LAST_NAMES = [
  'Okafor',
  'Yusuf',
  'Nnadi',
  'Bello',
  'Mustapha',
  'Deji-Aina',
  'Ajewole',
  'Adebiyi',
  'Joseph',
  'Fasina',
  'Obi',
  'Nwachukwu',
  'Adewale',
  'Balogun',
  'Abdullahi',
  'Fashola',
  'Alabi',
  'Akande',
  'Igwe',
  'Lawal',
  'Garba',
  'Eze',
  'Bakare',
  'Uche',
  'Chukwu',
  'Suleiman',
  'Adeyemi',
  'Ojo',
  'Nwosu',
  'Oyelaran',
];

const SCHOOL_DOMAIN = 'start-rite.sch.ng';

function slugEmail(first: string, last: string, index: number): string {
  const cleanFirst = first.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLast = last.toLowerCase().replace(/[^a-z]/g, '');
  return `${cleanFirst}.${cleanLast.slice(0, 1)}${String(index)}@${SCHOOL_DOMAIN}`;
}

function isoDate(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month - 1, day)).toISOString();
}

function phoneNumber(): string {
  return `+234 8${String(between(10, 99))} ${String(between(100, 999))} ${String(between(1000, 9999))}`;
}

export const sessions: SeedSession[] = [
  { id: 'ses-2024', start_year: 2024, end_year: 2025, label: '2024/2025' },
  { id: 'ses-2025', start_year: 2025, end_year: 2026, label: '2025/2026' },
];

export const school: SeedSchool = {
  id: 'sch-0001',
  name: 'Start-Rite International School, Abuja',
  abbreviation: 'SRIS',
  email: `admin@${SCHOOL_DOMAIN}`,
  class_system: 'primary',
  current_session_id: 'ses-2025',
};

export const grades: SeedGrade[] = Array.from({ length: 6 }, (_, index) => ({
  id: `grd-${String(index + 1)}`,
  name: `Primary ${String(index + 1)}`,
}));

const CLASS_SUFFIXES = ['A', 'B'];

export const classes: SeedClass[] = grades.flatMap((grade, gradeIndex) =>
  CLASS_SUFFIXES.map((suffix, suffixIndex) => ({
    id: `cls-${String(gradeIndex + 1)}${suffixIndex === 0 ? 'a' : 'b'}`,
    grade_id: grade.id,
    grade_name: grade.name,
    name: suffix,
    label: `${grade.name} ${suffix}`,
  })),
);

const TOTAL_TEACHERS = 42;

export const teachers: SeedTeacher[] = Array.from({ length: TOTAL_TEACHERS }, (_, index) => {
  const isFemale = random() > 0.45;
  const firstName = pick(isFemale ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE);
  const lastName = pick(LAST_NAMES);
  const joinYear = between(2015, 2026);
  const primaryClass = classes[index % classes.length]!;

  // A handful of accounts are disabled, so the badge has something to show.
  const isActive = index % 23 !== 0;

  return {
    id: `tch-${String(index + 1).padStart(3, '0')}`,
    teacher_id: `TCH-${String(joinYear)}-${String(index + 1).padStart(3, '0')}`,
    email: slugEmail(firstName, lastName, index + 1),
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`,
    class_id: primaryClass.id,
    is_active: isActive,
    created_at: isoDate(joinYear, between(1, 12), between(1, 28)),
    updated_at: isoDate(2026, 8, between(10, 25)),
  };
});

const TOTAL_STUDENTS = 150;

const RESULT_TITLES = [
  'Term 1 baseline',
  'Reading Fluency Check',
  'Number Recognition Check',
  'Midline Diagnostic',
  'End of Term Check',
];

function flnLevelFor(average: number): FlnLevel {
  if (average >= 85) return 5;
  if (average >= 70) return 4;
  if (average >= 55) return 3;
  if (average >= 40) return 2;
  return 1;
}

export const students: SeedStudent[] = Array.from({ length: TOTAL_STUDENTS }, (_, index) => {
  const studentClass = classes[index % classes.length]!;
  const gradeLevel = index % classes.length;
  const isFemale = random() > 0.5;
  const firstName = pick(isFemale ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE);
  const lastName = pick(LAST_NAMES);
  const age = Math.floor(gradeLevel / 2) + 6;

  const guardianFirst = pick(random() > 0.5 ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE);
  const hasGuardianEmail = random() > 0.4;

  // A handful of students are disabled (transferred out, withdrawn) and a
  // handful have never sat anything yet, so both empty states are real.
  const isActive = index % 31 !== 0;
  const notYetAssessed = index % 11 === 0;

  let fln: SeedStudentFln | null = null;
  if (!notYetAssessed) {
    const literacyAverage = between(30, 96);
    const numeracyAverage = between(30, 96);

    const recentResults: SeedRecentResult[] = Array.from(
      { length: between(1, 3) },
      (): SeedRecentResult => {
        const percentage = between(35, 95);
        return {
          assessment: pick(RESULT_TITLES),
          date: isoDate(2026, between(2, 8), between(1, 28)),
          percentage: percentage.toFixed(2),
          status: 'graded',
        };
      },
    ).sort((a, b) => b.date.localeCompare(a.date));

    fln = {
      literacy_level: flnLevelFor(literacyAverage),
      numeracy_level: flnLevelFor(numeracyAverage),
      last_assessed_at: recentResults[0]?.date ?? isoDate(2026, 8, 1),
      recent_results: recentResults,
    };
  }

  return {
    id: `stu-${String(index + 1).padStart(3, '0')}`,
    student_id: `STU-${String(2020 + (index % 6))}-${String(index + 1).padStart(3, '0')}`,
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`,
    date_of_birth: isoDate(2026 - age, between(1, 12), between(1, 28)),
    gender: isFemale ? 'female' : 'male',
    class_id: studentClass.id,
    is_active: isActive,
    guardian_name: `${guardianFirst} ${lastName}`,
    guardian_phone_number: phoneNumber(),
    guardian_email: hasGuardianEmail
      ? `${guardianFirst.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`
      : null,
    guardian_relationship: pick(['Mother', 'Father', 'Guardian', 'Aunt', 'Uncle']),
    created_at: isoDate(2026 - between(0, 3), 9, between(1, 20)),
    updated_at: isoDate(2026, 8, between(1, 25)),
    fln,
  };
});

const ASSESSMENT_NAMES = [
  'Letter Sound Fluency Check',
  'Word Reading Diagnostic',
  'Story Comprehension Check',
  'Oral Reading Fluency',
  'Number Recognition Check',
  'Addition & Subtraction Diagnostic',
  'Place Value Check',
  'Word Problems Practice',
];

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRTUVWXY346789';

function assessmentCode(): string {
  let code = '';
  for (let index = 0; index < 6; index += 1) {
    code += pick(CODE_ALPHABET.split(''));
  }
  return code;
}

export const assessments: SeedAssessment[] = teachers.flatMap((teacher) =>
  Array.from({ length: between(2, 5) }, (_, assessmentIndex) => {
    const status = pick<AssessmentStatus>(['closed', 'closed', 'published', 'draft']);
    const assigned = status === 'draft' ? 0 : between(10, 32);

    return {
      id: `asm-${teacher.id}-${String(assessmentIndex + 1)}`,
      name: pick(ASSESSMENT_NAMES),
      code: status === 'draft' ? '' : assessmentCode(),
      status,
      created_by: teacher.id,
      opens_at: status === 'draft' ? null : isoDate(2026, between(5, 8), between(1, 28)),
      closes_at: status === 'closed' ? isoDate(2026, between(8, 9), between(1, 28)) : null,
      assigned_count: assigned,
      graded_count:
        status === 'closed' ? assigned : status === 'published' ? between(0, assigned) : 0,
      created_at: isoDate(2026, between(5, 8), between(1, 28)),
    };
  }),
);

export const GUARDIAN_RELATIONSHIPS = [
  'Mother',
  'Father',
  'Guardian',
  'Aunt',
  'Uncle',
  'Grandparent',
  'Sibling',
] as const;
