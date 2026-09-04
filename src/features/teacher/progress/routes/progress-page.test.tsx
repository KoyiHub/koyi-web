import { describe, expect, it } from 'vitest';

import { renderRoute, screen, within } from '@/test/test-utils';

describe('ProgressPage', () => {
  it('renders the Class Progress heading', async () => {
    renderRoute('/teacher/progress');

    expect(await screen.findByRole('heading', { name: 'Class Progress' })).toBeInTheDocument();
    expect(screen.getByText('Primary 4 - Class A')).toBeInTheDocument();
  });

  it('renders previous assessment values', async () => {
    renderRoute('/teacher/progress');
    await screen.findByRole('heading', { name: 'Class Progress' });

    const comparison = screen
      .getByRole('heading', { name: 'Assessment Comparison' })
      .closest('section')!;
    const previous = within(comparison).getByText('Previous Assessment').closest('div')!;
    expect(within(previous).getByText('8')).toBeInTheDocument();
    expect(within(previous).getByText('15')).toBeInTheDocument();
    expect(within(previous).getByText('9')).toBeInTheDocument();
  });

  it('renders latest assessment values', async () => {
    renderRoute('/teacher/progress');
    await screen.findByRole('heading', { name: 'Class Progress' });

    const comparison = screen
      .getByRole('heading', { name: 'Assessment Comparison' })
      .closest('section')!;
    const latest = within(comparison).getByText('Latest Assessment').closest('div')!;
    expect(within(latest).getByText('12')).toBeInTheDocument();
    expect(within(latest).getByText('14')).toBeInTheDocument();
    expect(within(latest).getByText('6')).toBeInTheDocument();
  });

  it("renders Amina Yusuf's movement", async () => {
    renderRoute('/teacher/progress');
    await screen.findByRole('heading', { name: 'Class Progress' });

    const movements = screen
      .getByRole('heading', { name: 'Notable Movements' })
      .closest('section')!;
    const aminaCard = within(movements).getByText('Amina Yusuf').closest('li')!;
    expect(within(aminaCard).getByText('Intermediate')).toBeInTheDocument();
    expect(within(aminaCard).getByText('Strong')).toBeInTheDocument();
    expect(within(aminaCard).getByText('Improved')).toBeInTheDocument();
    expect(within(aminaCard).getByText(/Word reading, Comprehension/)).toBeInTheDocument();
  });

  it("renders Chidi Okoro's movement", async () => {
    renderRoute('/teacher/progress');
    await screen.findByRole('heading', { name: 'Class Progress' });

    const movements = screen
      .getByRole('heading', { name: 'Notable Movements' })
      .closest('section')!;
    const chidiCard = within(movements).getByText('Chidi Okoro').closest('li')!;
    expect(within(chidiCard).getByText('Struggling')).toBeInTheDocument();
    expect(within(chidiCard).getByText('Intermediate')).toBeInTheDocument();
    expect(within(chidiCard).getByText(/Subtraction/)).toBeInTheDocument();
  });

  it('renders skill progress support areas', async () => {
    renderRoute('/teacher/progress');
    await screen.findByRole('heading', { name: 'Class Progress' });

    const skillProgress = screen
      .getByRole('heading', { name: 'Skill Progress' })
      .closest('section')!;
    expect(within(skillProgress).getByText('Reading Fluency')).toBeInTheDocument();
    expect(within(skillProgress).getByText('Addition')).toBeInTheDocument();
    expect(within(skillProgress).getByText('Subtraction')).toBeInTheDocument();
    expect(within(skillProgress).getByText('Comprehension')).toBeInTheDocument();
  });
});
