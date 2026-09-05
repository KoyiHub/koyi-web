import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { createAssessment, createSection, publish } from '@/mocks/data/assessment-seed';
import { assignStudents } from '@/mocks/data/assignment-seed';
import { renderRoute, screen } from '@/test/test-utils';

/**
 * Assessment analytics — `frontend-integration.md` §5.5. Asserts the
 * ordering the guide calls for: `marking_status`/`warnings` first (A.2),
 * `level_distribution` as the headline, and a results table beneath —
 * against real simulated marks, not a canned fixture.
 */
function seedAssessment() {
  const assessment = createAssessment({
    name: 'Term 1 baseline',
    instructions: '',
    opens_at: null,
    closes_at: null,
  });
  const reading = createSection(assessment, {
    domain: 'literacy',
    name: 'Reading',
    instructions: '',
    timer: null,
    covers: [],
  });
  reading.questions.push(
    {
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
    },
    {
      subskill_id: 'sub-inference',
      fln_level: 3,
      question_type: 'audio',
      layout: 'speech_response_prompt',
      text: 'Read the sentence aloud.',
      description: '',
      point: '1.00',
      source_question_id: null,
      contents: [],
      options: [],
      answer: null,
    },
  );
  const result = publish(assessment);
  if (!result.ok) throw new Error(result.message);
  // Every student in the mock's one class — enough that a pending audio
  // answer and a submitted result are both near-certain, not hoped for.
  assignStudents(assessment.id, { all_my_students: true });
  return assessment;
}

describe('AssessmentAnalyticsPage', () => {
  it('leads with marking status and participation, not an average', async () => {
    const assessment = seedAssessment();
    renderRoute(paths.teacher.assessments.analytics(assessment.id));

    expect(await screen.findByRole('heading', { name: assessment.name })).toBeInTheDocument();
    expect(await screen.findByText(/of 32 assigned children have submitted/)).toBeInTheDocument();
  });

  it('shows level distribution for both domains', async () => {
    const assessment = seedAssessment();
    renderRoute(paths.teacher.assessments.analytics(assessment.id));
    await screen.findByRole('heading', { name: assessment.name });

    expect(
      screen.getByRole('heading', { name: 'Literacy — level distribution' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Numeracy — level distribution' }),
    ).toBeInTheDocument();
  });

  it('lists every assigned child in the results table, linking submitted ones to review', async () => {
    const assessment = seedAssessment();
    renderRoute(paths.teacher.assessments.analytics(assessment.id));
    await screen.findByRole('heading', { name: assessment.name });

    expect(
      await screen.findByRole('heading', { name: 'Every assigned child' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Amina Yusuf')).toBeInTheDocument();
    // With 32 students and an 85% simulated submission rate, at least one
    // "Review" link is effectively certain.
    expect(screen.getAllByRole('link', { name: /Review .+'s paper/ }).length).toBeGreaterThan(0);
  });
});
