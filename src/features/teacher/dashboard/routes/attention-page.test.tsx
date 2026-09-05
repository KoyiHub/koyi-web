import { describe, expect, it } from 'vitest';

import { createAssessment, createSection, publish } from '@/mocks/data/assessment-seed';
import { renderRoute, screen } from '@/test/test-utils';

/**
 * A published assessment with at least one question — the analytics roster
 * only has something to show once a paper exists. Mirrors the helper in
 * `assign-assessment-page.test.tsx`.
 */
function seedPublishedAssessment() {
  const assessment = createAssessment({
    name: 'Term 1 baseline',
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
    options: [{ type: 'text', value: 'B', is_correct: true }],
    answer: null,
  });
  const result = publish(assessment);
  if (!result.ok) throw new Error(result.message);
  return assessment;
}

/**
 * Who needs help — `frontend-integration.md` §5.5's `analytics/roster/`
 * endpoint, scoped to one assessment. There is no cross-assessment
 * "attention" endpoint, so this page picks an assessment first rather than
 * showing a priority-ranked list straight away.
 */
describe('AttentionPage', () => {
  it('defaults to the most recent assessment and lists who it flags', async () => {
    seedPublishedAssessment();
    renderRoute('/teacher/dashboard/attention');

    expect(
      await screen.findByRole('heading', { name: 'Students needing attention' }),
    ).toBeInTheDocument();
    expect(await screen.findByRole('combobox', { name: 'Assessment' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Roster' })).toBeInTheDocument();
  });

  it('lets a teacher narrow the roster by domain', async () => {
    seedPublishedAssessment();
    const { user } = renderRoute('/teacher/dashboard/attention');

    await screen.findByRole('heading', { name: 'Roster' });
    await user.selectOptions(screen.getByRole('combobox', { name: 'Domain' }), 'literacy');

    expect(screen.getByRole('combobox', { name: 'Domain' })).toHaveValue('literacy');
  });
});
