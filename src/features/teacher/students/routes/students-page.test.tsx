import { describe, expect, it } from 'vitest';

import { renderRoute, screen } from '@/test/test-utils';

describe('StudentsPage', () => {
  it('renders the roster from the fixture', async () => {
    renderRoute('/teacher/students');

    expect(await screen.findByRole('heading', { name: 'Students' })).toBeInTheDocument();
    expect(await screen.findByText('Amina Yusuf')).toBeInTheDocument();
    expect(screen.getByText('Fatima Bello')).toBeInTheDocument();
  });

  it('offers a level filter for every band plus everyone', async () => {
    renderRoute('/teacher/students');
    await screen.findByText('Amina Yusuf');

    for (const label of ['Everyone', 'Strong', 'Intermediate', 'Struggling', 'Not yet assessed']) {
      expect(screen.getByRole('button', { name: new RegExp(`^${label}`) })).toBeInTheDocument();
    }
  });

  it('narrows the roster when a level is chosen', async () => {
    const { user } = renderRoute('/teacher/students');
    await screen.findByText('Amina Yusuf');

    const struggling = screen.getByRole('button', { name: /^Struggling/ });
    await user.click(struggling);

    expect(struggling).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /^Everyone/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('links each row to that child’s learning profile', async () => {
    renderRoute('/teacher/students');
    await screen.findByText('Amina Yusuf');

    expect(screen.getByRole('link', { name: /Profile for Amina Yusuf/ })).toHaveAttribute(
      'href',
      '/teacher/students/stu-amina-yusuf',
    );
  });
});
