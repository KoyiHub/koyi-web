import { describe, expect, it } from 'vitest';

import { mockAuthUser } from '@/mocks/handlers';
import { renderRoute, screen } from '@/test/test-utils';

describe('DashboardPage', () => {
  it('renders a greeting using the authenticated teacher name', async () => {
    renderRoute('/teacher/dashboard');

    expect(
      await screen.findByRole(
        'heading',
        { name: `Good morning, ${mockAuthUser.first_name}` },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
  });

  it('renders the three summary stats', async () => {
    renderRoute('/teacher/dashboard');
    await screen.findByRole('heading', { name: `Good morning, ${mockAuthUser.first_name}` });

    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
    expect(screen.getByText('Assessed')).toBeInTheDocument();
    expect(screen.getByText('Needs Attention')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders the class distribution breakdown', async () => {
    renderRoute('/teacher/dashboard');
    await screen.findByRole('heading', { name: `Good morning, ${mockAuthUser.first_name}` });

    expect(screen.getByRole('heading', { name: 'Class Distribution' })).toBeInTheDocument();
    expect(screen.getByText('Strong')).toBeInTheDocument();
    expect(screen.getByText(/43% \(\d+ students\)/)).toBeInTheDocument();
  });

  it('renders students needing attention with a link to their profile', async () => {
    renderRoute('/teacher/dashboard');
    await screen.findByRole('heading', { name: `Good morning, ${mockAuthUser.first_name}` });

    expect(screen.getByRole('heading', { name: 'Students Needing Attention' })).toBeInTheDocument();
    expect(screen.getByText('Fatima Bello')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'View' })[0]).toHaveAttribute(
      'href',
      '/teacher/students/stu-fatima-bello',
    );
  });

  it('shows the Start Assessment quick action', async () => {
    renderRoute('/teacher/dashboard');

    expect(
      await screen.findByRole('link', { name: /^Start Assessment/ }, { timeout: 5000 }),
    ).toBeInTheDocument();
  });
});
