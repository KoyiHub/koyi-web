/**
 * PROVISIONAL UI fixture data. Roster, levels, and assessment history are
 * illustrative only — no Students/Groups backend contract is confirmed yet
 * (see CURRENT.md, "Revisit / Contract Questions"). `level` is presentation
 * data copied from the current design reference, not a computed score band;
 * this module intentionally contains no score-to-level calculation logic.
 * Replace with TanStack Query hooks behind the same shapes once endpoints
 * exist; no component here should need rewriting.
 */

export type StudentLevel = 'strong' | 'intermediate' | 'struggling';

export const studentLevelLabels: Record<StudentLevel, string> = {
  strong: 'Strong',
  intermediate: 'Intermediate',
  struggling: 'Struggling',
};

export interface AssessmentScore {
  percentage: number;
  /** PROVISIONAL per-skill FLN band label for this score. */
  label: string;
}

export interface LatestAssessment {
  date: string;
  reading: AssessmentScore;
  comprehension: AssessmentScore;
  mathematics: AssessmentScore;
}

export interface AssessmentHistoryEntry {
  date: string;
  /**
   * PROVISIONAL display label. The design reference includes "Beginner",
   * which is not part of the confirmed Strong/Intermediate/Struggling
   * mapping — kept verbatim here as fixture history, not a fourth level.
   */
  label: string;
  averagePercentage: number;
}

export interface Student {
  id: string;
  name: string;
  /** Display-only student ID, e.g. "2026-04A-12" — not a backend primary key. */
  studentCode: string;
  className: string;
  age: number;
  level: StudentLevel;
  learningGaps: string[];
  strengths: string[];
  lastAssessed: string;
  latestAssessment: LatestAssessment;
  history: AssessmentHistoryEntry[];
}

export const classContext = 'Primary 4 - Class A';

export const students: Student[] = [
  {
    id: 'stu-amina-yusuf',
    name: 'Amina Yusuf',
    studentCode: '2026-04A-12',
    className: classContext,
    age: 9,
    level: 'intermediate',
    learningGaps: ['Word reading', 'Reading comprehension', 'Subtraction'],
    strengths: ['Letter recognition', 'Basic addition'],
    lastAssessed: 'Aug 18, 2026',
    latestAssessment: {
      date: 'Aug 18, 2026',
      reading: { percentage: 62, label: 'Intermediate' },
      comprehension: { percentage: 60, label: 'Intermediate' },
      mathematics: { percentage: 80, label: 'Strong' },
    },
    history: [
      { date: 'Aug 18, 2026', label: 'Intermediate', averagePercentage: 67 },
      { date: 'May 12, 2026', label: 'Struggling', averagePercentage: 45 },
      { date: 'Feb 05, 2026', label: 'Beginner', averagePercentage: 30 },
    ],
  },
  {
    id: 'stu-chinedu-okafor',
    name: 'Chinedu Okafor',
    studentCode: '2026-04A-01',
    className: classContext,
    age: 10,
    level: 'strong',
    learningGaps: ['Subtraction'],
    strengths: ['Letter recognition', 'Reading comprehension', 'Basic addition'],
    lastAssessed: 'Aug 18, 2026',
    latestAssessment: {
      date: 'Aug 18, 2026',
      reading: { percentage: 88, label: 'Strong' },
      comprehension: { percentage: 85, label: 'Strong' },
      mathematics: { percentage: 90, label: 'Strong' },
    },
    history: [
      { date: 'Aug 18, 2026', label: 'Strong', averagePercentage: 88 },
      { date: 'May 12, 2026', label: 'Strong', averagePercentage: 82 },
      { date: 'Feb 05, 2026', label: 'Intermediate', averagePercentage: 68 },
    ],
  },
  {
    id: 'stu-fatima-bello',
    name: 'Fatima Bello',
    studentCode: '2026-04A-02',
    className: classContext,
    age: 9,
    level: 'struggling',
    learningGaps: ['Word reading', 'Letter sounds', 'Basic addition'],
    strengths: ['Listening comprehension'],
    lastAssessed: 'Aug 18, 2026',
    latestAssessment: {
      date: 'Aug 18, 2026',
      reading: { percentage: 38, label: 'Struggling' },
      comprehension: { percentage: 35, label: 'Struggling' },
      mathematics: { percentage: 42, label: 'Struggling' },
    },
    history: [
      { date: 'Aug 18, 2026', label: 'Struggling', averagePercentage: 38 },
      { date: 'May 12, 2026', label: 'Struggling', averagePercentage: 33 },
      { date: 'Feb 05, 2026', label: 'Beginner', averagePercentage: 22 },
    ],
  },
  {
    id: 'stu-zainab-idris',
    name: 'Zainab Idris',
    studentCode: '2026-04A-03',
    className: classContext,
    age: 10,
    level: 'strong',
    learningGaps: ['Place value'],
    strengths: ['Reading comprehension', 'Basic multiplication'],
    lastAssessed: 'Aug 18, 2026',
    latestAssessment: {
      date: 'Aug 18, 2026',
      reading: { percentage: 84, label: 'Strong' },
      comprehension: { percentage: 90, label: 'Strong' },
      mathematics: { percentage: 86, label: 'Strong' },
    },
    history: [
      { date: 'Aug 18, 2026', label: 'Strong', averagePercentage: 87 },
      { date: 'May 12, 2026', label: 'Intermediate', averagePercentage: 70 },
      { date: 'Feb 05, 2026', label: 'Intermediate', averagePercentage: 64 },
    ],
  },
  {
    id: 'stu-emeka-nnamdi',
    name: 'Emeka Nnamdi',
    studentCode: '2026-04A-04',
    className: classContext,
    age: 9,
    level: 'intermediate',
    learningGaps: ['Reading comprehension', 'Place value'],
    strengths: ['Basic addition'],
    lastAssessed: 'Aug 18, 2026',
    latestAssessment: {
      date: 'Aug 18, 2026',
      reading: { percentage: 65, label: 'Intermediate' },
      comprehension: { percentage: 58, label: 'Intermediate' },
      mathematics: { percentage: 63, label: 'Intermediate' },
    },
    history: [
      { date: 'Aug 18, 2026', label: 'Intermediate', averagePercentage: 62 },
      { date: 'May 12, 2026', label: 'Intermediate', averagePercentage: 55 },
      { date: 'Feb 05, 2026', label: 'Struggling', averagePercentage: 41 },
    ],
  },
  {
    id: 'stu-samuel-ojo',
    name: 'Samuel Ojo',
    studentCode: '2026-04A-05',
    className: classContext,
    age: 10,
    level: 'struggling',
    learningGaps: ['Word reading', 'Subtraction', 'Basic multiplication'],
    strengths: ['Letter recognition'],
    lastAssessed: 'Aug 18, 2026',
    latestAssessment: {
      date: 'Aug 18, 2026',
      reading: { percentage: 41, label: 'Struggling' },
      comprehension: { percentage: 37, label: 'Struggling' },
      mathematics: { percentage: 40, label: 'Struggling' },
    },
    history: [
      { date: 'Aug 18, 2026', label: 'Struggling', averagePercentage: 39 },
      { date: 'May 12, 2026', label: 'Struggling', averagePercentage: 34 },
      { date: 'Feb 05, 2026', label: 'Beginner', averagePercentage: 25 },
    ],
  },
  {
    id: 'stu-grace-mba',
    name: 'Grace Mba',
    studentCode: '2026-04A-06',
    className: classContext,
    age: 9,
    level: 'strong',
    learningGaps: ['Basic multiplication'],
    strengths: ['Word reading', 'Reading comprehension', 'Basic addition'],
    lastAssessed: 'Aug 18, 2026',
    latestAssessment: {
      date: 'Aug 18, 2026',
      reading: { percentage: 91, label: 'Strong' },
      comprehension: { percentage: 89, label: 'Strong' },
      mathematics: { percentage: 82, label: 'Strong' },
    },
    history: [
      { date: 'Aug 18, 2026', label: 'Strong', averagePercentage: 87 },
      { date: 'May 12, 2026', label: 'Strong', averagePercentage: 80 },
      { date: 'Feb 05, 2026', label: 'Intermediate', averagePercentage: 66 },
    ],
  },
  {
    id: 'stu-blessing-eze',
    name: 'Blessing Eze',
    studentCode: '2026-04A-07',
    className: classContext,
    age: 10,
    level: 'intermediate',
    learningGaps: ['Subtraction', 'Place value'],
    strengths: ['Word reading'],
    lastAssessed: 'Aug 18, 2026',
    latestAssessment: {
      date: 'Aug 18, 2026',
      reading: { percentage: 68, label: 'Intermediate' },
      comprehension: { percentage: 61, label: 'Intermediate' },
      mathematics: { percentage: 59, label: 'Intermediate' },
    },
    history: [
      { date: 'Aug 18, 2026', label: 'Intermediate', averagePercentage: 63 },
      { date: 'May 12, 2026', label: 'Intermediate', averagePercentage: 57 },
      { date: 'Feb 05, 2026', label: 'Struggling', averagePercentage: 44 },
    ],
  },
];

export function findStudentById(studentId: string): Student | undefined {
  return students.find((student) => student.id === studentId);
}
