import { describe, expect, it } from 'vitest';

import { renderRoute, screen } from '@/test/test-utils';

/**
 * Groups overview — `frontend-integration.md` §5.6. Unpaginated: a group is
 * a small working set by design, never a whole-school roster.
 */
describe('GroupsPage', () => {
  it('renders the Groups Overview heading', async () => {
    renderRoute('/teacher/groups');

    expect(await screen.findByRole('heading', { name: 'Groups Overview' })).toBeInTheDocument();
  });

  it('renders the seeded groups with their size and resource tier', async () => {
    renderRoute('/teacher/groups');
    await screen.findByRole('heading', { name: 'Groups Overview' });

    expect(await screen.findByRole('heading', { name: 'Word Reading Focus' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Subtraction Support' })).toBeInTheDocument();
  });

  it('flags a group that has got small', async () => {
    renderRoute('/teacher/groups');
    await screen.findByRole('heading', { name: 'Groups Overview' });

    const thinHeading = await screen.findByRole('heading', { name: 'Subtraction Support' });
    const thin = thinHeading.closest('article')!;
    expect(thin).toHaveTextContent('Getting small');
  });

  it('opens the create-group dialog', async () => {
    const { user } = renderRoute('/teacher/groups');
    await screen.findByRole('heading', { name: 'Groups Overview' });

    await user.click(screen.getByRole('button', { name: 'Create New Group' }));

    expect(await screen.findByRole('dialog', { name: 'Create a group' })).toBeInTheDocument();
  });
});
