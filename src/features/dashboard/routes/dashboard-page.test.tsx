import { describe, expect, it } from 'vitest';

import { renderRoute, screen } from '@/test/test-utils';

describe('DashboardPage', () => {
  it('renders the dashboard heading and class context', async () => {
    renderRoute('/');

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Overview of Primary 4 — Class A')).toBeInTheDocument();
  });

  it('renders the four summary metrics', async () => {
    renderRoute('/');
    await screen.findByRole('heading', { name: 'Dashboard' });

    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('renders the common learning gaps', async () => {
    renderRoute('/');
    await screen.findByRole('heading', { name: 'Dashboard' });

    expect(screen.getByText('Word Reading')).toBeInTheDocument();
    expect(screen.getByText('12 students struggling')).toBeInTheDocument();
    expect(screen.getByText('Subtraction')).toBeInTheDocument();
  });

  it('shows the Create Assessment action', async () => {
    renderRoute('/');

    expect(await screen.findByRole('button', { name: 'Create Assessment' })).toBeInTheDocument();
  });
});
