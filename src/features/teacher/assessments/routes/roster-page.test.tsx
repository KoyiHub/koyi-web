import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { createAssessment, createSection, publish } from '@/mocks/data/assessment-seed';
import { assignStudents } from '@/mocks/data/assignment-seed';
import { renderRoute, screen } from '@/test/test-utils';

/** The printable code sheet — `frontend-integration.md` §5.4, §7.4. */
describe('RosterPage', () => {
  it('shows the paper code and one slip per assigned child', async () => {
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
    assignStudents(assessment.id, { all_my_students: true });

    renderRoute(paths.teacher.assessments.roster(assessment.id));

    expect(await screen.findByText(assessment.code)).toBeInTheDocument();
    expect(screen.getByText('Amina Yusuf')).toBeInTheDocument();
    expect(screen.getAllByText(/·/).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Print' })).toBeInTheDocument();
  });

  it('says plainly when nobody is assigned yet', async () => {
    const assessment = createAssessment({
      name: 'Empty paper',
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

    renderRoute(paths.teacher.assessments.roster(assessment.id));

    expect(
      await screen.findByText('No children are assigned to this paper yet.'),
    ).toBeInTheDocument();
  });
});
