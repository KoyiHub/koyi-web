/**
 * PROVISIONAL in-memory database for the School Admin application.
 *
 * Shapes here follow `frontend-integration.md` §4 — snake_case fields,
 * string ids, ISO timestamps, the page-number list envelope from §2 (the
 * activity feed is the one cursor-paginated exception, handled separately
 * in `school-admin-handlers.ts`). Every School Admin screen is served by
 * MSW through the same query/mutation interface a real API would use, so
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
export type AssessmentStatus = 'draft' | 'published' | 'open' | 'closed';
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
  location: string;
  email: string;
  phone: string;
  address: string;
  motto: string;
  class_system: 'primary' | 'grade';
  current_session_id: string;
  current_term: string;
  term_starts_on: string;
  term_ends_on: string;
  timezone: string;
}

export interface SeedGrade {
  id: string;
  name: string;
  level: number;
}

export interface SeedClass {
  id: string;
  name: string;
  grade_id: string;
  grade_name: string;
  display_name: string;
  term: string;
  room: string | null;
  capacity: number;
  student_count: number;
  average_score: number;
  literacy_score: number;
  numeracy_score: number;
  created_at: string;
}

export interface SeedTeacherClass {
  class_id: string;
  class_name: string;
  grade_name: string;
  is_form_teacher: boolean;
  student_count: number;
}

export interface SeedTeacher {
  id: string;
  teacher_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  /** `invited`/`suspended` are pre-guide values with no anchor in the contract, left in
   *  place — only `active` ⇄ `disabled` is wired to a real guide action. */
  status: 'active' | 'invited' | 'suspended' | 'disabled';
  date_joined: string;
  last_login: string | null;
  qualification: string;
  subjects: string[];
  classes: SeedTeacherClass[];
}

export interface SeedAssessment {
  id: string;
  title: string;
  subject: 'literacy' | 'numeracy';
  assessment_type: 'baseline' | 'midline' | 'endline' | 'practice';
  grade_name: string;
  class_name: string;
  question_count: number;
  duration_minutes: number;
  status: AssessmentStatus;
  created_by: string;
  created_at: string;
  scheduled_for: string | null;
  students_assigned: number;
  students_completed: number;
  average_score: number | null;
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
  age: number;
  gender: 'female' | 'male';
  class_id: string;
  class_name: string;
  grade_name: string;
  status: 'active' | 'disabled';
  enrolled_on: string;
  guardian_name: string;
  guardian_phone: string;
  /** Optional — many guardians won't have one. Where an assessment link is sent. */
  guardian_email: string | null;
  guardian_relationship: string;
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

const QUALIFICATIONS = ['B.Ed Primary Education', 'B.A Education', 'NCE', 'B.Sc + PGDE', 'M.Ed'];

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
  location: 'Wuse II, Abuja',
  email: `admin@${SCHOOL_DOMAIN}`,
  phone: '+234 803 555 0142',
  address: '14 Aminu Kano Crescent, Wuse II, Abuja, FCT',
  motto: 'Every child reading and counting.',
  class_system: 'primary',
  current_session_id: 'ses-2025',
  current_term: 'Term 1',
  term_starts_on: isoDate(2026, 9, 14),
  term_ends_on: isoDate(2026, 12, 11),
  timezone: 'Africa/Lagos',
};

export const grades: SeedGrade[] = Array.from({ length: 6 }, (_, index) => ({
  id: `grd-${String(index + 1)}`,
  name: `Primary ${String(index + 1)}`,
  level: index + 1,
}));

const CLASS_SUFFIXES = ['Class A', 'Class B'];

export const classes: SeedClass[] = grades.flatMap((grade) =>
  CLASS_SUFFIXES.map((suffix, suffixIndex) => {
    const literacy = between(58, 92);
    const numeracy = between(55, 90);

    return {
      id: `cls-${String(grade.level)}${suffixIndex === 0 ? 'a' : 'b'}`,
      name: suffix,
      grade_id: grade.id,
      grade_name: grade.name,
      display_name: `${grade.name} - ${suffix}`,
      term: school.current_term,
      room: `Block ${String.fromCharCode(65 + suffixIndex)}${String(grade.level)}`,
      capacity: 20,
      // Backfilled from the student roster below, so counts always agree.
      student_count: 0,
      average_score: Math.round((literacy + numeracy) / 2),
      literacy_score: literacy,
      numeracy_score: numeracy,
      created_at: isoDate(2026, 9, 14),
    };
  }),
);

const TOTAL_TEACHERS = 42;

export const teachers: SeedTeacher[] = Array.from({ length: TOTAL_TEACHERS }, (_, index) => {
  const isFemale = random() > 0.45;
  const firstName = pick(isFemale ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE);
  const lastName = pick(LAST_NAMES);
  const joinYear = between(2015, 2026);
  const primaryClass = classes[index % classes.length]!;

  const teacherClasses: SeedTeacherClass[] = [
    {
      class_id: primaryClass.id,
      class_name: primaryClass.display_name,
      grade_name: primaryClass.grade_name,
      // A class has several teachers but exactly one form teacher: the first
      // member of staff dealt that class.
      is_form_teacher: index < classes.length,
      student_count: 0,
    },
  ];

  // Roughly a third of staff also cover a second class.
  if (random() > 0.66) {
    const secondary = classes[(index + 5) % classes.length]!;
    if (secondary.id !== primaryClass.id) {
      teacherClasses.push({
        class_id: secondary.id,
        class_name: secondary.display_name,
        grade_name: secondary.grade_name,
        is_form_teacher: false,
        student_count: 0,
      });
    }
  }

  // A handful of accounts are disabled, so the filter and badge have something to show.
  const status: SeedTeacher['status'] =
    index % 23 === 0 ? 'disabled' : index % 17 === 0 ? 'invited' : 'active';

  return {
    id: `tch-${String(index + 1).padStart(3, '0')}`,
    teacher_id: `TCH-${String(joinYear)}-${String(index + 1).padStart(3, '0')}`,
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`,
    email: slugEmail(firstName, lastName, index + 1),
    phone: phoneNumber(),
    status,
    date_joined: isoDate(joinYear, between(1, 12), between(1, 28)),
    last_login: status === 'invited' ? null : isoDate(2026, 8, between(10, 25)),
    qualification: pick(QUALIFICATIONS),
    subjects: random() > 0.5 ? ['Literacy', 'Numeracy'] : [pick(['Literacy', 'Numeracy'])],
    classes: teacherClasses,
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
  const gradeLevel = grades.find((grade) => grade.id === studentClass.grade_id)?.level ?? 1;
  const isFemale = random() > 0.5;
  const firstName = pick(isFemale ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE);
  const lastName = pick(LAST_NAMES);
  const age = gradeLevel + 5;

  const guardianFirst = pick(random() > 0.5 ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE);
  const hasGuardianEmail = random() > 0.4;

  // A handful of students are disabled (transferred out, withdrawn) and a
  // handful have never sat anything yet, so both empty states are real.
  const status: SeedStudent['status'] = index % 31 === 0 ? 'disabled' : 'active';
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
    age,
    gender: isFemale ? 'female' : 'male',
    class_id: studentClass.id,
    class_name: studentClass.display_name,
    grade_name: studentClass.grade_name,
    status,
    enrolled_on: isoDate(2026 - between(0, 3), 9, between(1, 20)),
    guardian_name: `${guardianFirst} ${lastName}`,
    guardian_phone: phoneNumber(),
    guardian_email: hasGuardianEmail
      ? `${guardianFirst.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`
      : null,
    guardian_relationship: pick(['Mother', 'Father', 'Guardian', 'Aunt', 'Uncle']),
    fln,
  };
});

for (const entry of classes) {
  entry.student_count = students.filter((student) => student.class_id === entry.id).length;
}

for (const teacher of teachers) {
  for (const teacherClass of teacher.classes) {
    teacherClass.student_count =
      classes.find((entry) => entry.id === teacherClass.class_id)?.student_count ?? 0;
  }
}

const ASSESSMENT_TITLES: Record<'literacy' | 'numeracy', string[]> = {
  literacy: [
    'Letter Sound Fluency Check',
    'Word Reading Diagnostic',
    'Story Comprehension Check',
    'Oral Reading Fluency',
  ],
  numeracy: [
    'Number Recognition Check',
    'Addition & Subtraction Diagnostic',
    'Place Value Check',
    'Word Problems Practice',
  ],
};

export const assessments: SeedAssessment[] = teachers.flatMap((teacher, teacherIndex) =>
  Array.from({ length: between(2, 5) }, (_, assessmentIndex) => {
    const subject: SeedAssessment['subject'] = random() > 0.5 ? 'literacy' : 'numeracy';
    const teacherClass = teacher.classes[assessmentIndex % teacher.classes.length];
    const status = pick<AssessmentStatus>(['closed', 'closed', 'open', 'published', 'draft']);
    const assigned = teacherClass?.student_count ?? 0;

    return {
      id: `asm-${String(teacherIndex + 1)}-${String(assessmentIndex + 1)}`,
      title: pick(ASSESSMENT_TITLES[subject]),
      subject,
      assessment_type: pick<SeedAssessment['assessment_type']>([
        'baseline',
        'midline',
        'endline',
        'practice',
      ]),
      grade_name: teacherClass?.grade_name ?? 'Primary 1',
      class_name: teacherClass?.class_name ?? 'Unassigned',
      question_count: between(10, 30),
      duration_minutes: between(10, 45),
      status,
      created_by: teacher.id,
      created_at: isoDate(2026, between(5, 8), between(1, 28)),
      scheduled_for: status === 'published' ? isoDate(2026, 9, between(1, 28)) : null,
      students_assigned: assigned,
      students_completed:
        status === 'closed' ? assigned : status === 'open' ? between(0, assigned) : 0,
      average_score: status === 'closed' ? between(48, 91) : null,
    };
  }),
);

/**
 * The signed-in administrator, shown on Settings. Mirrors `apps.users.User`
 * (id, email as the username field, first/last name, `email_verified`) plus
 * the security fields a School Admin account screen needs.
 *
 * `two_factor_enabled` has no guide anchor; kept, same "no anchor, left
 * alone" treatment as the rest of this pre-guide account endpoint.
 */
export const adminAccount = {
  id: '11111111-1111-4111-8111-111111111111',
  email: `admin@${SCHOOL_DOMAIN}`,
  first_name: 'Ngozi',
  last_name: 'Adeyemi',
  full_name: 'Ngozi Adeyemi',
  phone: '+234 803 555 0142',
  role: 'School Administrator',
  email_verified: true,
  two_factor_enabled: false,
  last_login: isoDate(2026, 8, 25),
  created_at: isoDate(2026, 1, 12),
};

export const GUARDIAN_RELATIONSHIPS = [
  'Mother',
  'Father',
  'Guardian',
  'Aunt',
  'Uncle',
  'Grandparent',
  'Sibling',
] as const;
