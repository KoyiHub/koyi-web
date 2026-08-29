import { describe, expect, it } from 'vitest';

import { renderRoute, screen } from '@/test/test-utils';

describe('TeacherDashboardPage', () => {
  it('greets the signed-in teacher by their short name', async () => {
    renderRoute('/teacher/dashboard');

    expect(
      await screen.findByRole('heading', { name: /Good morning, Mrs\. Amina/ }),
    ).toBeInTheDocument();
  });

  it('renders the three summary stats', async () => {
    renderRoute('/teacher/dashboard');
    await screen.findByRole('heading', { name: /Good morning/ });

    expect(screen.getByText('Total students')).toBeInTheDocument();
    expect(screen.getByText('Assessed this term')).toBeInTheDocument();
    expect(screen.getByText('Needing attention')).toBeInTheDocument();
  });

  it('renders the class distribution card with a link to the full report', async () => {
    renderRoute('/teacher/dashboard');
    await screen.findByRole('heading', { name: /Good morning/ });

    expect(screen.getByRole('heading', { name: 'Class distribution' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Open the full class performance report' }),
    ).toHaveAttribute('href', '/teacher/dashboard/class-performance');
  });

  it('links each drill-down card to its own page', async () => {
    renderRoute('/teacher/dashboard');
    await screen.findByRole('heading', { name: /Good morning/ });

    expect(screen.getByRole('link', { name: 'View all' })).toHaveAttribute(
      'href',
      '/teacher/dashboard/attention',
    );
    expect(screen.getByRole('link', { name: /View lesson plan/ })).toHaveAttribute(
      'href',
      '/teacher/dashboard/ai-insights',
    );
    expect(screen.getByRole('link', { name: /Recent activity/ })).toHaveAttribute(
      'href',
      '/teacher/dashboard/activity',
    );
  });

  it('lists the children needing attention with a link to each profile', async () => {
    renderRoute('/teacher/dashboard');
    await screen.findByRole('heading', { name: /Good morning/ });

    expect(screen.getByRole('heading', { name: 'Students needing attention' })).toBeInTheDocument();
    expect(screen.getByText('Fatima Bello')).toBeInTheDocument();
  });
});
