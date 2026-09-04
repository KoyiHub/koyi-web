import { describe, expect, it } from 'vitest';

import { renderRoute, screen, waitFor, within } from '@/test/test-utils';

/**
 * One group — `frontend-integration.md` §5.6. Criteria, membership history
 * (`join_reason`/`left_at`), and the lesson plan panel, `status`-driven —
 * `fallback` is shown normally, not as an error.
 */
describe('GroupDetailPage', () => {
  it('renders the group heading and criteria', async () => {
    renderRoute('/teacher/students/groups/grp-word-reading');

    expect(await screen.findByRole('heading', { name: 'Word Reading Focus' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Criteria' })).toBeInTheDocument();
    expect(screen.getByText(/Level ≤ 2/)).toBeInTheDocument();
  });

  it('shows current members, distinguishing matched from added', async () => {
    renderRoute('/teacher/students/groups/grp-word-reading');
    await screen.findByRole('heading', { name: 'Word Reading Focus' });

    const roster = screen
      .getByRole('heading', { name: 'Students in This Group' })
      .closest('section')!;
    expect(within(roster).getByText('Fatima Bello')).toBeInTheDocument();
    expect(within(roster).getAllByText(/Matched by criteria/).length).toBeGreaterThan(0);
    expect(within(roster).getByText('Amina Yusuf')).toBeInTheDocument();
    expect(within(roster).getByText(/Added by hand/)).toBeInTheDocument();
  });

  it('removes a current member', async () => {
    const { user } = renderRoute('/teacher/students/groups/grp-word-reading');
    await screen.findByRole('heading', { name: 'Word Reading Focus' });

    const roster = screen
      .getByRole('heading', { name: 'Students in This Group' })
      .closest('section')!;
    const aminaRow = within(roster).getByText('Amina Yusuf').closest('li')!;
    await user.click(within(aminaRow).getByRole('button', { name: 'Remove' }));

    await waitFor(() => {
      expect(within(roster).queryByText('Amina Yusuf')).not.toBeInTheDocument();
    });
  });

  it('generates a lesson plan when none exists yet', async () => {
    const { user } = renderRoute('/teacher/students/groups/grp-word-reading');
    await screen.findByRole('heading', { name: 'Word Reading Focus' });

    await screen.findByText('No plan has been generated yet.');
    await user.click(screen.getByRole('button', { name: 'Generate lesson plan' }));

    expect(await screen.findByRole('heading', { name: 'Lesson plan' })).toBeInTheDocument();
    expect(await screen.findByText(/Blend two-syllable words fluently/)).toBeInTheDocument();
  });

  it('renders a fallback plan normally, not as an error', async () => {
    const { user } = renderRoute('/teacher/students/groups/grp-subtraction-support');
    await screen.findByRole('heading', { name: 'Subtraction Support' });

    await screen.findByText('No plan has been generated yet.');
    await user.click(screen.getByRole('button', { name: 'Generate lesson plan' }));

    expect(
      await screen.findByText('Canonical plan — adaptation did not apply'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Build confidence borrowing across zero/)).toBeInTheDocument();
  });

  it('shows a safe not-found state for an unknown group ID', async () => {
    renderRoute('/teacher/students/groups/does-not-exist');

    expect(await screen.findByRole('alert')).toHaveTextContent('That group does not exist.');
  });
});
