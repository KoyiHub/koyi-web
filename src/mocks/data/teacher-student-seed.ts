/**
 * PROVISIONAL learning-profile seed.
 *
 * Built from the roster in `teacher-seed.ts` so a child's band, gaps and score
 * are the same figure on the dashboard, in the directory and on their profile.
 *
 * SECURITY BOUNDARY: the question log records what the child answered and how
 * the server graded it. It carries no expected answer and no `is_correct` flag
 * — see the note at the top of `student.schema.ts`.
 */

import type { PerformanceBand } from '@/features/teacher/api/shared.schema';
import type {
  LearningProfile,
  ProfileSkill,
  QuestionLogEntry,
} from '@/features/teacher/students/api/student.schema';

import { assessments } from './teacher-assessment-seed';
import { bankQuestions } from './teacher-question-seed';
import { bandLabels, CLASS_NAME, students } from './teacher-seed';

function bandFor(score: number): PerformanceBand {
  if (score >= 75) return 'strong';
  if (score >= 50) return 'intermediate';
  return 'struggling';
}

const LITERACY_SKILLS = [
  'Letter recognition',
  'Letter sounds',
  'Word reading',
  'Reading comprehension',
];
const NUMERACY_SKILLS = [
  'Counting and number sense',
  'Basic addition',
  'Subtraction',
  'Place value',
];

/**
 * A child scores lower on a skill the server has already flagged as a gap and
 * higher on one recorded as a strength. Deterministic, so profiles are stable
 * across reloads and test runs.
 */
function skillsFor(
  studentId: string,
  base: number,
  skills: string[],
  gaps: string[],
  strengths: string[],
): ProfileSkill[] {
  return skills.map((skill, index) => {
    const isGap = gaps.includes(skill);
    const isStrength = strengths.includes(skill);
    const offset = isGap ? -18 : isStrength ? 14 : ((index % 3) - 1) * 5;
    const score = Math.max(12, Math.min(97, base + offset));
    const band = bandFor(score);

    return {
      id: `${studentId}-${skill.toLowerCase().replace(/[^a-z]+/g, '-')}`,
      skill,
      score,
      band,
      band_label: bandLabels[band],
      change: isGap ? -4 : isStrength ? 7 : ((index % 4) - 1) * 2,
    };
  });
}

const RESPONSES: Record<string, string> = {
  single_choice: 'Chose option B',
  multiple_choice: 'Chose "hat" and "cup"',
  text: 'i wash my face and eat bread',
  audio: 'Recorded 4s answer',
  number: '27',
  true_false: 'False',
  file_upload: 'working-24x3.jpg',
};

function questionLogFor(studentId: string, base: number): QuestionLogEntry[] {
  const completed = assessments.filter((assessment) => assessment.status === 'closed');

  return completed.flatMap((assessment, assessmentIndex) =>
    assessment.questions.slice(0, 4).map((question, questionIndex) => {
      const seedValue = assessmentIndex * 7 + questionIndex * 3 + base;
      const outcome =
        seedValue % 9 === 0
          ? ('skipped' as const)
          : seedValue % 4 === 0
            ? ('incorrect' as const)
            : seedValue % 5 === 0
              ? ('partial' as const)
              : ('correct' as const);

      const awarded =
        outcome === 'correct'
          ? question.point
          : outcome === 'partial'
            ? Math.max(1, Math.round(question.point / 2))
            : 0;

      const bankEntry = bankQuestions.find((entry) => entry.id === question.id);

      return {
        id: `${studentId}-${assessment.id}-${question.id}`,
        assessment_id: assessment.id,
        assessment_title: assessment.title,
        question_text: question.text,
        question_type: question.question_type,
        subject: question.subject,
        skill: bankEntry?.skill ?? 'General',
        response:
          outcome === 'skipped' ? 'No answer given' : (RESPONSES[question.question_type] ?? '—'),
        outcome,
        points_awarded: awarded,
        points_possible: question.point,
        time_taken_label: `${String(25 + ((seedValue * 11) % 70))}s`,
        answered_at: assessment.updated_at,
      };
    }),
  );
}

const URGENCY = ['now', 'this_week', 'this_term'] as const;

const STEP_DETAIL: Record<string, string> = {
  'Word reading':
    'Ten minutes of paired decoding daily. Two-syllable words from the Term 1 list, clapped then read back.',
  'Reading comprehension':
    'Read one short passage together each day and ask for a retelling in their own words before any question.',
  'Letter sounds': 'Revisit blending with the phonics card set in the Monday and Thursday warm-up.',
  Subtraction:
    'Reteach borrowing with counters, starting with numbers that have no zero, then introducing zero in the tens.',
  'Place value': 'Ten minutes with base-ten blocks before the next numeracy topic starts.',
  'Basic addition': 'Number bonds to 20 in the daily warm-up until they are automatic.',
};

export function buildLearningProfile(studentId: string): LearningProfile | undefined {
  const student = students.find((entry) => entry.id === studentId);
  if (!student) return undefined;

  const base = student.latest_score ?? 45;
  const literacySkills = skillsFor(
    student.id,
    base,
    LITERACY_SKILLS,
    student.learning_gaps,
    student.strengths,
  );
  const numeracySkills = skillsFor(
    student.id,
    base + 4,
    NUMERACY_SKILLS,
    student.learning_gaps,
    student.strengths,
  );

  const averageOf = (skills: ProfileSkill[]) =>
    Math.round(skills.reduce((total, skill) => total + skill.score, 0) / skills.length);

  const literacyAverage = averageOf(literacySkills);
  const numeracyAverage = averageOf(numeracySkills);
  const level = student.level;

  const gapList =
    student.learning_gaps.length > 0 ? student.learning_gaps : ['Reading comprehension'];

  return {
    id: student.id,
    full_name: student.full_name,
    student_code: student.student_code,
    class_name: CLASS_NAME,
    age: student.age,
    avatar_url: student.avatar_url,
    level,
    level_label: bandLabels[level],
    overall_score: base,
    overall_change: student.level === 'struggling' ? -3 : 5,
    assessments_taken: student.level === 'beginner' ? 0 : 3,
    last_assessed_label: student.last_assessed_label,
    strengths: student.strengths,
    learning_gaps: student.learning_gaps,
    breakdown: [
      {
        subject: 'literacy',
        label: 'Literacy',
        overall_score: literacyAverage,
        band: bandFor(literacyAverage),
        band_label: bandLabels[bandFor(literacyAverage)],
        skills: literacySkills,
      },
      {
        subject: 'numeracy',
        label: 'Numeracy',
        overall_score: numeracyAverage,
        band: bandFor(numeracyAverage),
        band_label: bandLabels[bandFor(numeracyAverage)],
        skills: numeracySkills,
      },
    ],
    interpretation: {
      generated_label: `Generated ${student.last_assessed_label}, after Term 1 Literacy Baseline`,
      summary:
        student.level === 'strong'
          ? `${student.full_name.split(' ')[0] ?? 'This child'} is working above the class average in both subjects. The scores are consistent across skills, which usually means the next useful step is stretch work rather than revision.`
          : `${student.full_name.split(' ')[0] ?? 'This child'} understands more than they can read independently. Listening and comprehension scores sit well above decoding, so the obstacle is reading the words rather than following the meaning.`,
      evidence: [
        `Literacy average ${String(literacyAverage)}%, numeracy average ${String(numeracyAverage)}%`,
        `Lowest skill: ${gapList[0] ?? 'none recorded'}`,
        student.level === 'beginner'
          ? 'No completed assessment yet — figures shown are from the class baseline'
          : 'Based on 3 completed assessments this term',
      ],
      confidence:
        student.level === 'beginner' ? 'low' : student.level === 'strong' ? 'high' : 'medium',
    },
    next_steps: gapList.slice(0, 3).map((gap, index) => ({
      id: `${student.id}-step-${String(index + 1)}`,
      title: `Target ${gap.toLowerCase()}`,
      detail: STEP_DETAIL[gap] ?? 'Work with this child in a small focus group twice this week.',
      urgency: URGENCY[Math.min(index, URGENCY.length - 1)] ?? 'this_week',
      skill: gap,
    })),
    history: [
      {
        id: `${student.id}-hist-1`,
        label: 'Feb baseline',
        date_label: 'Feb 14, 2026',
        score: Math.max(10, base - 13),
        band: bandFor(Math.max(10, base - 13)),
      },
      {
        id: `${student.id}-hist-2`,
        label: 'May midline',
        date_label: 'May 20, 2026',
        score: Math.max(10, base - 6),
        band: bandFor(Math.max(10, base - 6)),
      },
      {
        id: `${student.id}-hist-3`,
        label: 'Aug baseline',
        date_label: 'Aug 18, 2026',
        score: base,
        band: bandFor(base),
      },
    ],
    question_log: student.level === 'beginner' ? [] : questionLogFor(student.id, base % 7),
  };
}
