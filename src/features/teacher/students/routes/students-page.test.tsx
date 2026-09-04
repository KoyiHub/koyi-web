import { describe, expect, it } from 'vitest';

import { renderRoute, screen } from '@/test/test-utils';

describe('StudentsPage', () => {
  it('renders the roster from the fixture', async () => {
    renderRoute('/teacher/students');

    expect(await screen.findByRole('heading', { name: 'Students' })).toBeInTheDocument();
    expect(await screen.findByText('Amina Yusuf')).toBeInTheDocument();
    expect(screen.getByText('Fatima Bello')).toBeInTheDocument();
  });

  it('narrows the roster with the search box', async () => {
    const { user } = renderRoute('/teacher/students');
    await screen.findByText('Amina Yusuf');

    await user.type(screen.getByRole('searchbox', { name: 'Search students' }), 'Fatima');

    expect(screen.getByText('Fatima Bello')).toBeInTheDocument();
    expect(screen.queryByText('Amina Yusuf')).not.toBeInTheDocument();
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
