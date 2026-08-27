/**
 * PROVISIONAL in-memory database for the School Admin application.
 *
 * The Django project currently ships `apps.common` and `apps.users` only —
 * there is no School, Class, Student, Teacher or Assessment model yet, and no
 * confirmed School Portal URL. Every School Admin screen is therefore served
 * by MSW through the same query/mutation interface a real API would use, so
 * moving to Django is a base-path change in each feature's `endpoints.ts`
 * and nothing else.
 *
 * Shapes here deliberately follow Django/DRF conventions — snake_case fields,
 * string ids, ISO timestamps, `{ count, results }` list envelopes — so the Zod
 * response schemas that parse them should survive the switch.
 *
 * Figures are generated from a fixed seed: the same school appears on every
 * reload and in every test run, which keeps assertions stable. They are
 * illustrative only. The FLN band labels (strong / intermediate / struggling)
 * are presentation values carried on the response — the real thresholds are
 * unconfirmed and are never computed in the browser.
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

export type PerformanceBand = 'strong' | 'intermediate' | 'struggling';
export type LearningLevel = 'strong' | 'intermediate' | 'struggling' | 'beginner';

export interface SeedSchool {
  id: string;
  name: string;
  location: string;
  email: string;
  phone: string;
  address: string;
  logo_url: string | null;
  motto: string;
  class_system: 'primary' | 'grade';
  current_session: string;
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
  status: 'active' | 'invited' | 'suspended';
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
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  created_by: string;
  created_at: string;
  scheduled_for: string | null;
  students_assigned: number;
  students_completed: number;
  average_score: number | null;
}

export interface SeedStudentAssessment {
  id: string;
  assessment_id: string;
  title: string;
  subject: 'literacy' | 'numeracy';
  assessment_type: 'baseline' | 'midline' | 'endline' | 'practice';
  taken_on: string;
  score: number;
  band: PerformanceBand;
  administered_by: string;
}

export interface SeedDomainScore {
  key: string;
  label: string;
  score: number;
  band: PerformanceBand;
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
  level: LearningLevel;
  enrolled_on: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_relationship: string;
  domain_scores: SeedDomainScore[];
  strengths: string[];
  learning_gaps: string[];
  assessments: SeedStudentAssessment[];
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

function bandFor(score: number): PerformanceBand {
  if (score >= 75) return 'strong';
  if (score >= 55) return 'intermediate';
  return 'struggling';
}

function levelFor(average: number): LearningLevel {
  if (average >= 75) return 'strong';
  if (average >= 55) return 'intermediate';
  if (average >= 40) return 'struggling';
  return 'beginner';
}

export const school: SeedSchool = {
  id: 'sch-0001',
  name: 'Start-Rite International School, Abuja',
  location: 'Wuse II, Abuja',
  email: `admin@${SCHOOL_DOMAIN}`,
  phone: '+234 803 555 0142',
  address: '14 Aminu Kano Crescent, Wuse II, Abuja, FCT',
  logo_url: null,
  motto: 'Every child reading and counting.',
  class_system: 'primary',
  current_session: '2025/2026',
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

  return {
    id: `tch-${String(index + 1).padStart(3, '0')}`,
    teacher_id: `TCH-${String(joinYear)}-${String(index + 1).padStart(3, '0')}`,
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`,
    email: slugEmail(firstName, lastName, index + 1),
    phone: phoneNumber(),
    status: index % 17 === 0 ? 'invited' : 'active',
    date_joined: isoDate(joinYear, between(1, 12), between(1, 28)),
    last_login: index % 17 === 0 ? null : isoDate(2026, 8, between(10, 25)),
    qualification: pick(QUALIFICATIONS),
    subjects: random() > 0.5 ? ['Literacy', 'Numeracy'] : [pick(['Literacy', 'Numeracy'])],
    classes: teacherClasses,
  };
});

const TOTAL_STUDENTS = 150;

const DOMAINS = [
  { key: 'reading', label: 'Reading' },
  { key: 'comprehension', label: 'Comprehension' },
  { key: 'mathematics', label: 'Mathematics' },
];

const STRENGTH_POOL = [
  'Letter recognition',
  'Basic addition',
  'Word building',
  'Number sequencing',
  'Listening comprehension',
  'Shape recognition',
];

const GAP_POOL = [
  'Word reading',
  'Reading comprehension',
  'Subtraction',
  'Place value',
  'Story retelling',
  'Multiplication facts',
];

function samplePool(pool: readonly string[], count: number): string[] {
  const remaining = [...pool];
  const chosen: string[] = [];

  for (let index = 0; index < count && remaining.length > 0; index += 1) {
    const [item] = remaining.splice(Math.floor(random() * remaining.length), 1);
    if (item) chosen.push(item);
  }

  return chosen;
}

const SITTINGS: { month: number; day: number; type: SeedStudentAssessment['assessment_type'] }[] = [
  { month: 2, day: 5, type: 'baseline' },
  { month: 5, day: 12, type: 'midline' },
  { month: 8, day: 18, type: 'endline' },
];

const SITTING_LABEL: Record<SeedStudentAssessment['assessment_type'], string> = {
  baseline: 'Baseline',
  midline: 'Midline',
  endline: 'End of Term',
  practice: 'Practice',
};

export const students: SeedStudent[] = Array.from({ length: TOTAL_STUDENTS }, (_, index) => {
  const studentClass = classes[index % classes.length]!;
  const gradeLevel = grades.find((grade) => grade.id === studentClass.grade_id)?.level ?? 1;
  const isFemale = random() > 0.5;
  const firstName = pick(isFemale ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE);
  const lastName = pick(LAST_NAMES);
  const age = gradeLevel + 5;

  const domainScores: SeedDomainScore[] = DOMAINS.map((domain) => {
    const score = between(38, 94);
    return { key: domain.key, label: domain.label, score, band: bandFor(score) };
  });

  const average = Math.round(
    domainScores.reduce((total, domain) => total + domain.score, 0) / domainScores.length,
  );

  const guardianFirst = pick(random() > 0.5 ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE);
  const formTeacher = teachers.find((teacher) =>
    teacher.classes.some((entry) => entry.class_id === studentClass.id && entry.is_form_teacher),
  );

  // Three sittings a year — a February baseline, a May midline and this
  // term's assessment — so the history timeline always has something to draw.
  const assessments: SeedStudentAssessment[] = SITTINGS.map((sitting, sittingIndex) => {
    // Scores trend upward across the year, landing on the current average.
    const score = Math.max(
      20,
      Math.min(98, average - (SITTINGS.length - 1 - sittingIndex) * between(10, 20)),
    );
    const subject: SeedStudentAssessment['subject'] =
      sittingIndex % 2 === 0 ? 'literacy' : 'numeracy';

    return {
      id: `sta-${String(index + 1)}-${String(sittingIndex + 1)}`,
      assessment_id: `asm-${String(gradeLevel)}-${String(sittingIndex + 1)}`,
      title: `${studentClass.grade_name} ${SITTING_LABEL[sitting.type]} ${subject === 'literacy' ? 'Literacy' : 'Numeracy'} Check`,
      subject,
      assessment_type: sitting.type,
      taken_on: isoDate(2026, sitting.month, sitting.day),
      score,
      band: bandFor(score),
      administered_by: formTeacher?.full_name ?? 'Unassigned',
    };
  }).reverse();

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
    level: levelFor(average),
    enrolled_on: isoDate(2026 - between(0, 3), 9, between(1, 20)),
    guardian_name: `${guardianFirst} ${lastName}`,
    guardian_phone: phoneNumber(),
    guardian_relationship: pick(['Mother', 'Father', 'Guardian', 'Aunt', 'Uncle']),
    domain_scores: domainScores,
    strengths: samplePool(STRENGTH_POOL, 2),
    learning_gaps: samplePool(GAP_POOL, 3),
    assessments,
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
    const status = pick<SeedAssessment['status']>([
      'completed',
      'completed',
      'active',
      'scheduled',
      'draft',
    ]);
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
      scheduled_for: status === 'scheduled' ? isoDate(2026, 9, between(1, 28)) : null,
      students_assigned: assigned,
      students_completed:
        status === 'completed' ? assigned : status === 'active' ? between(0, assigned) : 0,
      average_score: status === 'completed' ? between(48, 91) : null,
    };
  }),
);

/**
 * The signed-in administrator, shown on Settings. Mirrors `apps.users.User`
 * (id, email as the username field, first/last name, `email_verified`) plus
 * the security fields a School Admin account screen needs.
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
