import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { createAssessment, createSection, publish } from '@/mocks/data/assessment-seed';
import { assignStudents } from '@/mocks/data/assignment-seed';
import { computeReviewQueue, getResults } from '@/mocks/data/results-seed';
import { renderRoute, screen } from '@/test/test-utils';

/**
 * Responses the AI could not settle — `frontend-integration.md` §5.5. This
 * screen is read-only (no resolution endpoint exists in the guide), so the
 * only behaviour to verify is that pending items are named and link into
 * context.
 */
function seedAssessmentWithPendingItems(): string {
  for (let attempt = 0; attempt < 10; attempt += 1) {
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
    });
    const result = publish(assessment);
    if (!result.ok) throw new Error(result.message);
    assignStudents(assessment.id, { all_my_students: true });

    const results = getResults(assessment.id);
    if (results && computeReviewQueue(results).length > 0) {
      return assessment.id;
    }
  }
  throw new Error('Could not seed an assessment with a pending review item.');
}

describe('ReviewQueuePage', () => {
  it('names each pending response and links into that paper', async () => {
    const assessmentId = seedAssessmentWithPendingItems();
    renderRoute(paths.teacher.assessments.reviewQueue(assessmentId));

    expect(await screen.findByRole('heading', { name: 'Review queue' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Open paper' }).length).toBeGreaterThan(0);
  });

  it('says plainly when nothing is waiting', async () => {
    const assessment = createAssessment({
      name: 'Untouched paper',
      instructions: '',
      opens_at: null,
      closes_at: null,
    });
    const section = createSection(assessment, {
      domain: 'numeracy',
      name: 'Numbers',
      instructions: '',
      timer: null,
      covers: [],
    });
    section.questions.push({
      subskill_id: 'sub-number-identification',
      fln_level: 1,
      question_type: 'single_choice',
      layout: 'media_grid_choice',
      text: 'Which number is this?',
      description: '',
      point: '1.00',
      source_question_id: null,
      contents: [],
      options: [{ type: 'text', value: '7', is_correct: true }],
      answer: null,
    });
    const result = publish(assessment);
    if (!result.ok) throw new Error(result.message);
    // Nobody assigned — nothing can be pending.

    renderRoute(paths.teacher.assessments.reviewQueue(assessment.id));

    expect(await screen.findByText('Nothing waiting')).toBeInTheDocument();
  });
});
