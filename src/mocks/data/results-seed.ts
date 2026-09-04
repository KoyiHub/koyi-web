/**
 * Simulates a sat paper for every currently-assigned student of an
 * assessment — `frontend-integration.md` §5.5.
 *
 * Nothing in the mock world otherwise produces a *completed* sitting for a
 * teacher-created assessment: the runner (`runner-seed.ts`) is a fixed,
 * separate demo paper, and Phase 3's assignments never progress past
 * `not_started` because nothing drives them through the runner. Results,
 * analytics and review all need marked responses to exist, so this module
 * deterministically fabricates them from the assessment's own authored
 * questions — which already carry a real answer key (`is_correct`) — rather
 * than leaving every screen empty.
 *
 * Deterministic, not random: every outcome comes from a string hash of
 * (student id, question id, purpose), so repeated reads within a session
 * agree with each other and a test can rely on a specific outcome without a
 * seeded RNG library.
 *
 * SECURITY BOUNDARY: this file legitimately computes `is_correct` — it
 * stands in for the backend's marker, the same trust boundary as
 * `assessment-seed.ts` holding authored answer keys. Nothing under
 * `/v1/student/*` reads from here.
 */
import type { AuthoredQuestion } from '@/features/teacher/assessments/api/assessment.schema';
import type { Domain, FlnLevel } from '@/lib/api/contracts';
import type { StoredAssessment, StoredSection } from '@/mocks/data/assessment-seed';
import { assessmentStore } from '@/mocks/data/assessment-seed';
import { getAssignments, type StoredAssignment } from '@/mocks/data/assignment-seed';
import { findSubskillSeed } from '@/mocks/data/taxonomy-seed';
import { students as allStudents } from '@/mocks/data/teacher-seed';

/* -------------------------------------------------------------------------- */
/* Deterministic hashing                                                      */
/* -------------------------------------------------------------------------- */

function hash(input: string): number {
  let h = 0;
  for (let index = 0; index < input.length; index += 1) {
    h = (h * 31 + input.charCodeAt(index)) | 0;
  }
  return Math.abs(h);
}

/** A stable pseudo-random figure in `[0, 1)` for a given key. */
function ratio(...parts: string[]): number {
  return (hash(parts.join(':')) % 10_000) / 10_000;
}

function pick<T>(pool: T[], ...parts: string[]): T {
  const item = pool[hash(parts.join(':')) % pool.length];
  if (item === undefined) throw new Error('pick() called with an empty pool.');
  return item;
}

/* -------------------------------------------------------------------------- */
/* Per-question outcome                                                       */
/* -------------------------------------------------------------------------- */

export type QuestionOutcome =
  | { kind: 'skipped' }
  | {
      kind: 'answered';
      isCorrect: boolean | null;
      /** Index into the question's own `options` array — stored questions carry no option id. */
      selectedOptionIndex: number | null;
      textValue: string;
      gradedBy: 'auto' | 'ai';
      gradingConfidence: number | null;
      errorType: string | null;
      observationNote: string | null;
      awardedPoints: string;
    };

const OPTION_BASED = new Set(['single_choice', 'multiple_choice', 'true_false']);
const ASYNC_MARKED = new Set(['text', 'audio']);

const ERROR_TYPES = ['substitution', 'omission', 'reversal', 'guess'];
const OBSERVATION_NOTES = [
  'Chose the visually similar option.',
  'Hesitated, then answered quickly.',
  'Answer suggests the concept before this one is still shaky.',
  'Close, but missed the last step.',
];

/** Baseline correctness probability for a student, before the question's level pulls it down. */
function abilityFor(studentId: string): number {
  return 0.35 + ratio(studentId, 'ability') * 0.55;
}

function correctnessProbability(studentId: string, flnLevel: number): number {
  const raw = abilityFor(studentId) - (flnLevel - 1) * 0.08;
  return Math.min(0.95, Math.max(0.05, raw));
}

function simulateQuestion(studentId: string, question: AuthoredQuestion): QuestionOutcome {
  if (ratio(studentId, question.id ?? '', 'skipped') < 0.05) {
    return { kind: 'skipped' };
  }

  const isCorrect =
    ratio(studentId, question.id ?? '', 'outcome') <
    correctnessProbability(studentId, question.fln_level);

  if (question.question_type === 'file_upload') {
    // "No marker. Stays pending for a teacher." — frontend-integration.md §5.3.
    return {
      kind: 'answered',
      isCorrect: null,
      selectedOptionIndex: null,
      textValue: '',
      gradedBy: 'auto',
      gradingConfidence: null,
      errorType: null,
      observationNote: null,
      awardedPoints: '0.00',
    };
  }

  if (OPTION_BASED.has(question.question_type) || question.question_type === 'number') {
    const correctIndex = question.options.findIndex((option) => option.is_correct);
    const wrongIndexes = question.options
      .map((option, index) => ({ option, index }))
      .filter((entry) => !entry.option.is_correct)
      .map((entry) => entry.index);
    const selectedIndex = isCorrect
      ? correctIndex
      : wrongIndexes.length > 0
        ? pick(wrongIndexes, studentId, question.id ?? '')
        : correctIndex;
    const selectedOption = question.options[selectedIndex];

    return {
      kind: 'answered',
      isCorrect,
      selectedOptionIndex: selectedIndex >= 0 ? selectedIndex : null,
      textValue: question.question_type === 'number' ? (selectedOption?.value ?? '') : '',
      gradedBy: 'auto',
      gradingConfidence: null,
      errorType: null,
      observationNote: null,
      awardedPoints: isCorrect ? question.point : '0.00',
    };
  }

  // text / audio — the two-pass AI marker. A deterministic minority stay
  // pending, so `marking_status.pending` and the review queue are never empty.
  if (ASYNC_MARKED.has(question.question_type)) {
    if (ratio(studentId, question.id ?? '', 'pending') < 0.15) {
      return {
        kind: 'answered',
        isCorrect: null,
        selectedOptionIndex: null,
        textValue: '(recorded answer)',
        gradedBy: 'ai',
        gradingConfidence: null,
        errorType: null,
        observationNote: null,
        awardedPoints: '0.00',
      };
    }

    return {
      kind: 'answered',
      isCorrect,
      selectedOptionIndex: null,
      textValue: '(recorded answer)',
      gradedBy: 'ai',
      gradingConfidence:
        Math.round((0.6 + ratio(studentId, question.id ?? '', 'confidence') * 0.4) * 100) / 100,
      errorType: isCorrect ? null : pick(ERROR_TYPES, studentId, question.id ?? ''),
      observationNote: isCorrect ? null : pick(OBSERVATION_NOTES, studentId, question.id ?? ''),
      awardedPoints: isCorrect ? question.point : '0.00',
    };
  }

  return { kind: 'skipped' };
}

/* -------------------------------------------------------------------------- */
/* Per-student, per-assessment result                                         */
/* -------------------------------------------------------------------------- */

export interface QuestionResult {
  section: StoredSection;
  question: AuthoredQuestion;
  /** Position within its section — stored questions carry no `order` field, only array position. */
  order: number;
  skillName: string;
  subskillName: string;
  outcome: QuestionOutcome;
}

export interface StudentResult {
  assignment: StoredAssignment;
  studentId: string;
  fullName: string;
  studentCode: string;
  className: string;
  /** Whether this student is treated as having submitted, for this simulation. */
  submitted: boolean;
  status: 'not_started' | 'in_progress' | 'finished' | 'graded';
  items: QuestionResult[];
  itemsAttempted: number;
  itemsCorrect: number;
  pending: number;
  percentage: number | null;
  levels: Partial<Record<Domain, FlnLevel | null>>;
}

export interface AssessmentResults {
  assessment: StoredAssessment;
  students: StudentResult[];
}

function allQuestions(
  assessment: StoredAssessment,
): { section: StoredSection; question: AuthoredQuestion; order: number }[] {
  return assessment.sections.flatMap((section) =>
    section.questions.map((question, index) => ({ section, question, order: index + 1 })),
  );
}

/** The lowest probed level not passed in a domain; the highest probed level if every one was. */
function placementFor(items: QuestionResult[], domain: Domain): FlnLevel | null {
  const inDomain = items.filter((item) => item.section.domain === domain);
  if (inDomain.length === 0) return null;

  const byLevel = new Map<number, QuestionResult[]>();
  for (const item of inDomain) {
    const level = item.question.fln_level;
    const bucket = byLevel.get(level) ?? [];
    bucket.push(item);
    byLevel.set(level, bucket);
  }

  const levels = Array.from(byLevel.keys()).sort((a, b) => a - b);
  for (const level of levels) {
    const bucket = byLevel.get(level) ?? [];
    const marked = bucket.filter(
      (item) => item.outcome.kind === 'answered' && item.outcome.isCorrect !== null,
    );
    const allPassed =
      marked.length > 0 &&
      marked.every((item) => item.outcome.kind === 'answered' && item.outcome.isCorrect);
    if (!allPassed) return level as FlnLevel;
  }

  return (levels[levels.length - 1] ?? null) as FlnLevel | null;
}

function computeStudentResult(
  assessment: StoredAssessment,
  assignment: StoredAssignment,
  questions: { section: StoredSection; question: AuthoredQuestion; order: number }[],
): StudentResult {
  const student = allStudents.find((entry) => entry.id === assignment.student_id);
  const submitted = ratio(assignment.student_id, assessment.id, 'submitted') < 0.85;

  const items: QuestionResult[] = questions.map(({ section, question, order }) => {
    const resolved = findSubskillSeed(question.subskill_id);
    return {
      section,
      question,
      order,
      skillName: resolved?.skill.name ?? 'General',
      subskillName: resolved?.subskill.name ?? 'General',
      outcome: submitted ? simulateQuestion(assignment.student_id, question) : { kind: 'skipped' },
    };
  });

  const attempted = items.filter((item) => item.outcome.kind === 'answered');
  const correct = attempted.filter(
    (item) => item.outcome.kind === 'answered' && item.outcome.isCorrect === true,
  );
  const pending = attempted.filter(
    (item) => item.outcome.kind === 'answered' && item.outcome.isCorrect === null,
  );

  const percentage =
    submitted && attempted.length > 0
      ? Math.round((correct.length / attempted.length) * 10000) / 100
      : null;

  const status: StudentResult['status'] = !submitted
    ? 'not_started'
    : pending.length > 0
      ? 'finished'
      : 'graded';

  return {
    assignment,
    studentId: assignment.student_id,
    fullName: student?.full_name ?? 'Unknown student',
    studentCode: student?.student_code ?? '',
    className: student?.class_name ?? '',
    submitted,
    status,
    items,
    itemsAttempted: attempted.length,
    itemsCorrect: correct.length,
    pending: pending.length,
    percentage,
    levels: {
      literacy: placementFor(items, 'literacy'),
      numeracy: placementFor(items, 'numeracy'),
    },
  };
}

const cache = new Map<string, AssessmentResults>();

/** Called from `afterEach` in `src/test/setup.ts` so one test's simulated marks don't leak into the next. */
export function resetResultsState(): void {
  cache.clear();
}

/**
 * The computed-and-cached result set for one assessment. Every screen this
 * phase builds (analytics, the results table, the roster, review-queue, one
 * child's response review, and that child's cross-assessment `/skills/`)
 * reads through this, so the numbers agree everywhere they overlap.
 */
export function getResults(assessmentId: string): AssessmentResults | null {
  const cached = cache.get(assessmentId);
  if (cached) return cached;

  const assessment = assessmentStore.find((entry) => entry.id === assessmentId);
  if (!assessment) return null;

  const questions = allQuestions(assessment);
  const assignments = getAssignments(assessmentId);
  const results: AssessmentResults = {
    assessment,
    students: assignments.map((assignment) =>
      computeStudentResult(assessment, assignment, questions),
    ),
  };
  cache.set(assessmentId, results);
  return results;
}

export function findStudentResult(assessmentId: string, studentId: string): StudentResult | null {
  const results = getResults(assessmentId);
  return results?.students.find((entry) => entry.studentId === studentId) ?? null;
}

/**
 * Every assessment (newest-created first) a student has simulated results
 * in — the source for the student skills page's cross-assessment view.
 */
export function assessmentsFor(
  studentId: string,
): { assessment: StoredAssessment; result: StudentResult }[] {
  return assessmentStore
    .map((assessment) => {
      const results = getResults(assessment.id);
      const result = results?.students.find(
        (entry) => entry.studentId === studentId && entry.submitted,
      );
      return result ? { assessment, result } : null;
    })
    .filter(
      (entry): entry is { assessment: StoredAssessment; result: StudentResult } => entry !== null,
    );
}

/** Roughly 4 times out of 5, by assessment id — so the narrative's `null` path is exercised by default. */
export function narrativeAvailable(assessmentId: string): boolean {
  return ratio(assessmentId, 'narrative') < 0.8;
}

/* -------------------------------------------------------------------------- */
/* JSON shapes — the exact fields `results.schema.ts` / `skills.schema.ts`    */
/* expect. Kept here rather than in the handlers so the handlers stay thin.   */
/* -------------------------------------------------------------------------- */

function optionId(questionId: string, index: number): string {
  return `${questionId}-opt-${String(index)}`;
}

function emptyLevelCounts(): Record<string, number> {
  return { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
}

function increment(record: Record<string, number>, key: string): void {
  record[key] = (record[key] ?? 0) + 1;
}

export function toResultsRow(result: StudentResult) {
  return {
    student_id: result.studentId,
    full_name: result.fullName,
    school_class: result.className,
    status: result.status,
    percentage: result.percentage === null ? null : result.percentage.toFixed(2),
    literacy_level: result.levels.literacy ?? null,
    numeracy_level: result.levels.numeracy ?? null,
  };
}

function toReviewQuestion(item: QuestionResult) {
  const question = item.question;
  const questionId = question.id ?? '';

  const options = question.options.map((option, index) => ({
    id: optionId(questionId, index),
    value: option.value,
    is_correct: option.is_correct,
    was_selected: item.outcome.kind === 'answered' && item.outcome.selectedOptionIndex === index,
  }));

  const response =
    item.outcome.kind === 'skipped'
      ? null
      : {
          id: `resp-${questionId}`,
          text_value: item.outcome.textValue,
          transcript: question.question_type === 'audio' ? item.outcome.textValue : '',
          is_correct: item.outcome.isCorrect,
          awarded_points: item.outcome.awardedPoints,
          graded_by: item.outcome.gradedBy,
          grading_confidence: item.outcome.gradingConfidence,
          error_type: item.outcome.errorType,
          observation_note: item.outcome.observationNote,
        };

  return {
    id: questionId,
    order: item.order,
    text: question.text,
    question_type: question.question_type,
    layout: question.layout ?? 'media_grid_choice',
    fln_level: question.fln_level,
    subskill_name: item.subskillName,
    skill_name: item.skillName,
    section_name: item.section.name,
    contents: question.contents,
    options,
    response,
  };
}

export function toStudentResponses(assessment: StoredAssessment, result: StudentResult) {
  return {
    student_id: result.studentId,
    full_name: result.fullName,
    assessment_id: assessment.id,
    assessment_name: assessment.name,
    status: result.status,
    items_attempted: result.itemsAttempted,
    items_correct: result.itemsCorrect,
    pending: result.pending,
    percentage: (result.percentage ?? 0).toFixed(2),
    questions: result.items.map(toReviewQuestion),
  };
}

export function toAnalyticsRosterRow(result: StudentResult) {
  const weak = result.items
    .filter((item) => item.outcome.kind === 'answered' && item.outcome.isCorrect === false)
    .map((item) => `${item.subskillName} (L${String(item.question.fln_level)})`);

  return {
    student_id: result.studentId,
    full_name: result.fullName,
    school_class: result.className,
    literacy_level: result.levels.literacy ?? null,
    numeracy_level: result.levels.numeracy ?? null,
    weak_subskills: Array.from(new Set(weak)).slice(0, 5),
  };
}

/**
 * The reasons a response stays pending mirror the guide's own prose:
 * "when the model was unavailable, when its confidence was too low to act
 * on, or when a recording failed." `file_upload` is the one deterministic
 * case; the other two are functionally identical (both just `null`), so
 * which label a given item gets is itself a stable hash pick, for variety.
 */
function pendingReason(
  studentId: string,
  questionId: string,
  questionType: string,
): 'file_upload' | 'ai_unavailable' | 'low_confidence' {
  if (questionType === 'file_upload') return 'file_upload';
  return ratio(studentId, questionId, 'reason') < 0.5 ? 'ai_unavailable' : 'low_confidence';
}

const REVIEW_QUEUE_REASON_LABEL: Record<
  'file_upload' | 'ai_unavailable' | 'low_confidence',
  string
> = {
  file_upload: 'Uploaded file — needs a teacher to mark it',
  ai_unavailable: 'The AI marker was unavailable',
  low_confidence: "The AI marker's confidence was too low to act on",
};

export function computeReviewQueue(results: AssessmentResults) {
  const items: {
    student_id: string;
    full_name: string;
    question_id: string;
    question_text: string;
    question_type: string;
    subskill_name: string;
    reason: 'file_upload' | 'ai_unavailable' | 'low_confidence';
    reason_label: string;
  }[] = [];

  for (const student of results.students) {
    if (!student.submitted) continue;
    for (const item of student.items) {
      if (item.outcome.kind !== 'answered' || item.outcome.isCorrect !== null) continue;
      const questionId = item.question.id ?? '';
      const reason = pendingReason(student.studentId, questionId, item.question.question_type);
      items.push({
        student_id: student.studentId,
        full_name: student.fullName,
        question_id: questionId,
        question_text: item.question.text,
        question_type: item.question.question_type,
        subskill_name: item.subskillName,
        reason,
        reason_label: REVIEW_QUEUE_REASON_LABEL[reason],
      });
    }
  }
  return items;
}

interface Narrative {
  summary: string;
  attention: string;
  strength: string;
}

function pickStrength(
  skillMatrix: { skill_name: string; levels: Record<string, { passed: number; total: number }> }[],
): string {
  let best: { name: string; ratio: number } | null = null;
  for (const skill of skillMatrix) {
    const totals = Object.values(skill.levels).reduce(
      (sum, level) => ({ passed: sum.passed + level.passed, total: sum.total + level.total }),
      { passed: 0, total: 0 },
    );
    if (totals.total === 0) continue;
    const skillRatio = totals.passed / totals.total;
    if (!best || skillRatio > best.ratio) best = { name: skill.skill_name, ratio: skillRatio };
  }
  return best?.name ?? 'No clear standout yet';
}

export function computeAnalytics(results: AssessmentResults, includeNarrative: boolean) {
  const submitted = results.students.filter((student) => student.submitted);

  const levelDistribution = { literacy: emptyLevelCounts(), numeracy: emptyLevelCounts() };
  for (const student of submitted) {
    if (student.levels.literacy)
      increment(levelDistribution.literacy, String(student.levels.literacy));
    if (student.levels.numeracy)
      increment(levelDistribution.numeracy, String(student.levels.numeracy));
  }

  let total = 0;
  let marked = 0;
  const skillTotals = new Map<
    string,
    { domain: Domain; levels: Map<number, { passed: number; total: number }> }
  >();
  const missCounts = new Map<
    string,
    { subskillName: string; flnLevel: number; failed: number; total: number }
  >();

  for (const student of submitted) {
    for (const item of student.items) {
      if (item.outcome.kind !== 'answered') continue;
      total += 1;
      const isPending = item.outcome.isCorrect === null;
      if (!isPending) marked += 1;

      const skillEntry = skillTotals.get(item.skillName) ?? {
        domain: item.section.domain,
        levels: new Map<number, { passed: number; total: number }>(),
      };
      const levelEntry = skillEntry.levels.get(item.question.fln_level) ?? { passed: 0, total: 0 };
      levelEntry.total += 1;
      if (item.outcome.isCorrect) levelEntry.passed += 1;
      skillEntry.levels.set(item.question.fln_level, levelEntry);
      skillTotals.set(item.skillName, skillEntry);

      const missKey = `${item.subskillName}-${String(item.question.fln_level)}`;
      const missEntry = missCounts.get(missKey) ?? {
        subskillName: item.subskillName,
        flnLevel: item.question.fln_level,
        failed: 0,
        total: 0,
      };
      missEntry.total += 1;
      if (!isPending && !item.outcome.isCorrect) missEntry.failed += 1;
      missCounts.set(missKey, missEntry);
    }
  }

  const skillMatrix = Array.from(skillTotals.entries()).map(([skillName, entry]) => ({
    skill_name: skillName,
    domain: entry.domain,
    levels: Object.fromEntries(
      Array.from(entry.levels.entries()).map(([level, counts]) => [String(level), counts]),
    ),
  }));

  const mostMissed = Array.from(missCounts.values())
    .map((entry) => ({
      subskill_name: entry.subskillName,
      fln_level: entry.flnLevel as FlnLevel,
      failed_pct: entry.total > 0 ? Math.round((entry.failed / entry.total) * 100) : 0,
    }))
    .filter((entry) => entry.failed_pct > 0)
    .sort((a, b) => b.failed_pct - a.failed_pct)
    .slice(0, 5);

  const percentages = submitted
    .map((student) => student.percentage)
    .filter((value): value is number => value !== null);
  const averagePercentage =
    percentages.length > 0
      ? percentages.reduce((sum, value) => sum + value, 0) / percentages.length
      : 0;

  const pending = total - marked;
  const warnings: string[] = [];
  if (pending > 0) {
    warnings.push(
      `${String(pending)} of ${String(total)} answers are still being marked. These figures will change.`,
    );
  }
  if (submitted.length < results.students.length) {
    const notYetSubmitted = results.students.length - submitted.length;
    warnings.push(
      `${String(notYetSubmitted)} of ${String(results.students.length)} assigned children have not submitted yet.`,
    );
  }

  const narrative: Narrative | null =
    includeNarrative && narrativeAvailable(results.assessment.id)
      ? {
          summary: mostMissed[0]
            ? `Most children are progressing steadily. The class struggles most with ${mostMissed[0].subskill_name} at Level ${String(mostMissed[0].fln_level)}.`
            : 'Most children are progressing steadily, with no single subskill standing out as a common gap.',
          attention: mostMissed[0]?.subskill_name ?? 'No particular subskill',
          strength: pickStrength(skillMatrix),
        }
      : null;

  return {
    marking_status: { total, marked, pending },
    level_distribution: levelDistribution,
    participation: { assigned: results.students.length, submitted: submitted.length },
    skill_matrix: skillMatrix,
    most_missed: mostMissed,
    average_percentage: averagePercentage.toFixed(2),
    warnings,
    narrative,
  };
}

/* -------------------------------------------------------------------------- */
/* Student skills — GET /v1/teacher/students/{id}/skills/                    */
/* -------------------------------------------------------------------------- */

export function computeStudentSkills(studentId: string) {
  const history = assessmentsFor(studentId);
  const [latest, previous] = history;
  if (!latest) return null;

  const literacyLevel = latest.result.levels.literacy ?? 1;
  const numeracyLevel = latest.result.levels.numeracy ?? 1;

  const skillMap = new Map<
    string,
    { domain: Domain; passed: Set<number>; all: Set<number>; weak: Set<string> }
  >();
  for (const item of latest.result.items) {
    if (item.outcome.kind !== 'answered') continue;
    const entry = skillMap.get(item.skillName) ?? {
      domain: item.section.domain,
      passed: new Set<number>(),
      all: new Set<number>(),
      weak: new Set<string>(),
    };
    entry.all.add(item.question.fln_level);
    if (item.outcome.isCorrect) {
      entry.passed.add(item.question.fln_level);
    } else if (item.outcome.isCorrect === false) {
      entry.weak.add(`${item.subskillName} (L${String(item.question.fln_level)})`);
    }
    skillMap.set(item.skillName, entry);
  }

  const skills = Array.from(skillMap.entries()).map(([skillName, entry]) => {
    const passedLevels = Array.from(entry.passed);
    const highestLevelPassed =
      passedLevels.length > 0 ? (Math.max(...passedLevels) as FlnLevel) : null;
    const sortedLevels = Array.from(entry.all).sort((a, b) => a - b);
    const brokeDownAt = sortedLevels.find((level) => !entry.passed.has(level));
    return {
      skill_name: skillName,
      domain: entry.domain,
      highest_level_passed: highestLevelPassed,
      broke_down_at: (brokeDownAt ?? null) as FlnLevel | null,
      weak_subskills: Array.from(entry.weak).slice(0, 5),
    };
  });

  const movement = (['literacy', 'numeracy'] as const).map((domain) => {
    const current = domain === 'literacy' ? literacyLevel : numeracyLevel;
    const previousLevel = previous?.result.levels[domain];
    if (!previousLevel) {
      return { domain, previous: null, current, direction: 'new' as const };
    }
    const direction = current > previousLevel ? 'up' : current < previousLevel ? 'down' : 'same';
    return { domain, previous: previousLevel, current, direction };
  });

  const narrative: Narrative | null = narrativeAvailable(`${studentId}-skills`)
    ? {
        summary: `${latest.result.fullName} is ${literacyLevel === numeracyLevel ? 'at the same level in both domains' : 'progressing at different rates in literacy and numeracy'}, per the most recent assessment.`,
        attention:
          skills.find((skill) => skill.weak_subskills.length > 0)?.skill_name ??
          'No particular skill',
        strength:
          skills.find((skill) => skill.weak_subskills.length === 0)?.skill_name ?? 'Still emerging',
      }
    : null;

  return {
    student_id: studentId,
    full_name: latest.result.fullName,
    literacy_level: literacyLevel,
    numeracy_level: numeracyLevel,
    last_assessed_at: latest.assessment.published_at,
    skills,
    movement,
    narrative,
  };
}
