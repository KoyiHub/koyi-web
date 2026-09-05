import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { renderRoute, screen, within } from '@/test/test-utils';

/**
 * End to end through the authoring workspace against the real MSW contract
 * (`frontend-integration.md` §5.3): a draft is created, a section added, a
 * question written, coverage reflects it, and publishing mints a code.
 *
 * This is the load-bearing test for Phase 1 of the refactor — every step here
 * is a real request, not a mock of the component's own state.
 */
describe('CreateAssessmentPage', () => {
  it('walks a teacher from a blank draft to a published code', async () => {
    const { user } = renderRoute(paths.teacher.assessments.create);
    await screen.findByRole('heading', { name: 'Build an Assessment' });

    // Step 1 — Details creates the real draft.
    await user.type(screen.getByLabelText('Name'), 'Term 1 baseline');
    await user.click(screen.getByRole('button', { name: 'Create draft and continue' }));

    // Step 2 — Sections.
    await screen.findByText('Add a section');
    await user.type(screen.getByLabelText('Name'), 'Reading');
    await user.click(screen.getByRole('button', { name: 'Add section' }));

    const sectionRow = await screen.findByText('Reading');
    await user.click(sectionRow);

    // Step 3 — Questions: write one, and mark it correct.
    await screen.findByText(/0 questions saved|questions saved/);
    await user.click(screen.getByRole('button', { name: 'Write a question' }));

    const questionText = await screen.findByPlaceholderText('What is the child asked?');
    await user.type(questionText, 'Which letter makes this sound?');

    const optionInputs = screen.getAllByPlaceholderText('Option text');
    await user.type(optionInputs[0]!, 'B');
    await user.type(optionInputs[1]!, 'D');

    await screen.findByText('1 question saved');

    // Step 4 — Coverage reflects the saved question.
    await user.click(screen.getByRole('button', { name: '4. Coverage' }));
    await screen.findByText(/question.*across Literacy/);

    // Step 5 — Publish mints a code.
    await user.click(screen.getByRole('button', { name: '5. Publish' }));
    await user.click(screen.getByRole('button', { name: 'Publish' }));

    const dialog = await screen.findByRole('dialog', { name: 'Publish this assessment?' });
    await user.click(within(dialog).getByRole('button', { name: 'Publish' }));

    expect(
      await screen.findByText(
        'Published. Children sit this paper with the code below — it cannot be edited or deleted now.',
      ),
    ).toBeInTheDocument();
    // A six-character code, drawn from the alphabet that skips O/0, I/1, S/5, Z/2.
    expect(screen.getByText(/^[A-HJ-NP-RT-Y346789]{6}$/)).toBeInTheDocument();
  });

  it('resumes a draft from its URL and does not recreate it', async () => {
    // Create one via the flow, then read the id the URL was given back —
    // `?assessmentId=` is what makes a refresh mid-build resume rather than
    // restart (create-assessment-page.tsx).
    const { user, router } = renderRoute(paths.teacher.assessments.create);
    await screen.findByRole('heading', { name: 'Build an Assessment' });
    await user.type(screen.getByLabelText('Name'), 'Resumable draft');
    await user.click(screen.getByRole('button', { name: 'Create draft and continue' }));
    await screen.findByText('Add a section');

    const search = router.state.location.search;
    expect(search).toMatch(/assessmentId=/);

    // A fresh mount at the same URL (simulating a refresh) resumes at Sections.
    renderRoute(`${paths.teacher.assessments.create}${search}`);
    expect(await screen.findByText('Add a section')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Create draft and continue' }),
    ).not.toBeInTheDocument();
  });
});
