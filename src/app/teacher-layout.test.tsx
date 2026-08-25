import { describe, expect, it } from 'vitest';

import { renderRoute, screen } from '@/test/test-utils';

describe('TeacherLayout', () => {
  it('renders the teacher navigation destinations', async () => {
    renderRoute('/');

    expect(await screen.findByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Assessment' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Students/Groups' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Progress' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Teacher profile/ })).toBeInTheDocument();
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
    const { user } = renderRoute('/');

    await user.click(await screen.findByRole('button', { name: 'Open navigation menu' }));
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeVisible();

    await user.keyboard('{Escape}');

    // The drawer backdrop is removed once closed.
    expect(document.querySelector('[aria-hidden="true"].fixed.inset-0')).not.toBeInTheDocument();
  });
});
