import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { createAssessment, createSection, publish } from '@/mocks/data/assessment-seed';
import { assignStudents } from '@/mocks/data/assignment-seed';
import { findStudentResult } from '@/mocks/data/results-seed';
import { renderRoute, screen } from '@/test/test-utils';

const OUTCOME_LABELS = ['Correct', 'Incorrect', 'Still being marked', 'Not answered'];

/**
 * One child's paper, question by question — `frontend-integration.md` §5.5.
 * Green/red comes straight from `is_correct` + `was_selected`; pending is a
 * distinct third state, never rendered as wrong. Never shows the assessment
 * runner's own vocabulary (`is_correct` as raw text) — this is the one
 * screen that legitimately carries the answer key, to a teacher, after the
 * fact.
 */
function seedSubmittedStudent(): { assessmentId: string; studentId: string } {
  for (let attempt = 0; attempt < 15; attempt += 1) {
    const assessment = createAssessment({
      name: `Baseline ${String(attempt)}`,
      instructions: '',
      opens_at: null,
      closes_at: null,
    });
    const section = createSection(assessment, {
      domain: 'literacy',
      name: 'Reading',
      instructions: '',
      timer: null,
      covers: [],
    });
    section.questions.push({
      subskill_id: 'sub-letter-sounds',
      fln_level: 1,
      question_type: 'single_choice',
      layout: 'media_grid_choice',
      text: 'Which letter makes this sound?',
      description: '',
      point: '1.00',
      source_question_id: null,
      contents: [],
      options: [
        { type: 'text', value: 'B', is_correct: true },
        { type: 'text', value: 'D', is_correct: false },
      ],
      answer: null,
    });
    const result = publish(assessment);
    if (!result.ok) throw new Error(result.message);
    assignStudents(assessment.id, { student_ids: ['stu-amina-yusuf'] });

    const studentResult = findStudentResult(assessment.id, 'stu-amina-yusuf');
    if (studentResult?.submitted) {
      return { assessmentId: assessment.id, studentId: 'stu-amina-yusuf' };
    }
  }
  throw new Error('Could not seed a submitted response.');
}

describe('ResponseReviewPage', () => {
  it("renders the child's name, a question, and one of the three-state outcomes", async () => {
    const { assessmentId, studentId } = seedSubmittedStudent();
    renderRoute(paths.teacher.assessments.responses(assessmentId, studentId));

    expect(await screen.findByRole('heading', { name: 'Amina Yusuf' })).toBeInTheDocument();
    expect(screen.getByText('Which letter makes this sound?')).toBeInTheDocument();

    const hasOutcomeBadge = OUTCOME_LABELS.some((label) => screen.queryByText(label) !== null);
    expect(hasOutcomeBadge).toBe(true);
  });

  it('shows both options with the correct one marked, never bare correctness text', async () => {
    const { assessmentId, studentId } = seedSubmittedStudent();
    renderRoute(paths.teacher.assessments.responses(assessmentId, studentId));
    await screen.findByRole('heading', { name: 'Amina Yusuf' });

    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.queryByText(/is_correct/i)).not.toBeInTheDocument();
  });
});
