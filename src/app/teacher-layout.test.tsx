import { describe, expect, it } from 'vitest';

import { renderRoute, screen } from '@/test/test-utils';

describe('TeacherLayout', () => {
  it('renders the teacher navigation destinations', async () => {
    renderRoute('/dashboard');

    expect(await screen.findByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Assessment' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Students/Groups' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Progress' })).toBeInTheDocument();
  });

  it('shows Settings and Help in the sidebar footer, with no sidebar logout or profile row', async () => {
    renderRoute('/dashboard');

    await screen.findByRole('link', { name: 'Dashboard' });
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Teacher profile/ })).not.toBeInTheDocument();
  });

  it('marks the current route as active via aria-current', async () => {
    renderRoute('/assessment');

    expect(await screen.findByRole('link', { name: 'Assessment' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current');
  });

  it('opens and closes the mobile navigation drawer', async () => {
    const { user } = renderRoute('/dashboard');

    await user.click(await screen.findByRole('button', { name: 'Open navigation menu' }));
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeVisible();

    await user.keyboard('{Escape}');

    // The drawer backdrop is removed once closed.
    expect(document.querySelector('[aria-hidden="true"].fixed.inset-0')).not.toBeInTheDocument();
  });

  it('does not list Question Bank in the primary sidebar nav', async () => {
    renderRoute('/dashboard');

    await screen.findByRole('link', { name: 'Dashboard' });
    expect(screen.queryByRole('link', { name: 'Question Bank' })).not.toBeInTheDocument();
  });

  it('navigates to the profile route from the topbar avatar', async () => {
    const { user } = renderRoute('/dashboard');

    await user.click(await screen.findByRole('link', { name: 'Go to your teacher profile' }));

    expect(await screen.findByRole('heading', { name: /profile/i })).toBeInTheDocument();
  });
});
