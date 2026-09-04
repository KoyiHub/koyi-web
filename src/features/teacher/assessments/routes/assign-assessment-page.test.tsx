import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import type { StoredAssessment } from '@/mocks/data/assessment-seed';
import { createAssessment, createSection, publish } from '@/mocks/data/assessment-seed';
import { renderRoute, screen, within } from '@/test/test-utils';

/**
 * Assigning a published paper — `frontend-integration.md` §5.4. Assigning
 * twice is a deliberate no-op, so the interesting behaviour is the "assigned
 * fewer than selected" report, guardian-link failures being named rather than
 * swallowed, and withdrawal only being offered before a child has started.
 */
function seedPublishedAssessment(name = 'Term 1 baseline'): StoredAssessment {
  const assessment = createAssessment({
    name,
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
  // `publish()` only checks that every section carries at least one
  // question — this stands in for a real authored one.
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

/** The "Assigned children" card, distinct from the student picker above it — both can show the same name. */
async function assignedChildrenCard(): Promise<HTMLElement> {
  const heading = await screen.findByRole('heading', { name: 'Assigned children' });
  const card = heading.closest('section');
  if (!card) throw new Error('Could not find the Assigned children card.');
  return card;
}

describe('AssignAssessmentPage', () => {
  it('assigns a whole class and lists the assigned children', async () => {
    const assessment = seedPublishedAssessment();
    const { user } = renderRoute(paths.teacher.assessments.assignFor(assessment.id));

    await screen.findByRole('heading', { name: `Assign "${assessment.name}"` });
    await user.click(await screen.findByRole('checkbox', { name: /Primary 4/ }));
    await user.click(screen.getByRole('button', { name: 'Assign' }));

    expect(await screen.findByText('Assigned 32 students.')).toBeInTheDocument();
    const card = await assignedChildrenCard();
    expect(within(card).getByText('Amina Yusuf')).toBeInTheDocument();
  });

  it('reports assigning individual students fewer than selected the second time', async () => {
    const assessment = seedPublishedAssessment();
    const { user } = renderRoute(paths.teacher.assessments.assignFor(assessment.id));

    await screen.findByRole('heading', { name: `Assign "${assessment.name}"` });
    await user.click(screen.getByRole('radio', { name: 'Individual students' }));

    await user.click(await screen.findByRole('checkbox', { name: /Amina Yusuf/ }));
    await user.click(screen.getByRole('button', { name: 'Assign' }));
    expect(await screen.findByText('Assigned 1 student.')).toBeInTheDocument();

    // Amina again, plus a new child this time.
    await user.click(await screen.findByRole('checkbox', { name: /Amina Yusuf/ }));
    await user.click(screen.getByRole('checkbox', { name: /Chinedu Okafor/ }));
    await user.click(screen.getByRole('button', { name: 'Assign' }));

    expect(
      await screen.findByText(
        'Assigned 1 of 2 selected — the rest were already assigned, outside your school, or disabled.',
      ),
    ).toBeInTheDocument();
  });

  it('withdraws a not-started assignment', async () => {
    const assessment = seedPublishedAssessment();
    const { user } = renderRoute(paths.teacher.assessments.assignFor(assessment.id));

    await screen.findByRole('heading', { name: `Assign "${assessment.name}"` });
    await user.click(screen.getByRole('radio', { name: 'Individual students' }));
    await user.click(await screen.findByRole('checkbox', { name: /Amina Yusuf/ }));
    await user.click(screen.getByRole('button', { name: 'Assign' }));

    const card = await assignedChildrenCard();
    const row = within(card).getByText('Amina Yusuf').closest('li');
    expect(row).not.toBeNull();
    await user.click(within(row!).getByRole('button', { name: 'Withdraw' }));

    expect(await within(card).findByText('Nobody assigned yet')).toBeInTheDocument();
  });

  it('sends a guardian link and names a child who could not be reached', async () => {
    const assessment = seedPublishedAssessment();
    const { user } = renderRoute(paths.teacher.assessments.assignFor(assessment.id));

    await screen.findByRole('heading', { name: `Assign "${assessment.name}"` });
    await user.click(screen.getByRole('radio', { name: 'Individual students' }));
    // Amina Yusuf (index 0) has no guardian email in the seed; Chinedu (index 1) does.
    await user.click(await screen.findByRole('checkbox', { name: /Amina Yusuf/ }));
    await user.click(screen.getByRole('checkbox', { name: /Chinedu Okafor/ }));
    await user.click(screen.getByRole('button', { name: 'Assign' }));
    await screen.findByText('Assigned 2 students.');

    const card = await assignedChildrenCard();
    const aminaRow = within(card).getByText('Amina Yusuf').closest('li');
    await user.click(within(aminaRow!).getByRole('button', { name: 'Send link' }));

    expect(
      await within(card).findByText(/Amina Yusuf — No guardian email on file\./),
    ).toBeInTheDocument();

    const chineduRow = within(card).getByText('Chinedu Okafor').closest('li');
    await user.click(within(chineduRow!).getByRole('button', { name: 'Send link' }));

    expect(await within(card).findByText('Sent 1 guardian link.')).toBeInTheDocument();
  });
});
