import { describe, expect, it } from 'vitest';

import { renderRoute, screen, within } from '@/test/test-utils';

describe('GroupsPage', () => {
  it('renders the Groups Overview heading', async () => {
    renderRoute('/students/groups');

    expect(await screen.findByRole('heading', { name: 'Groups Overview' })).toBeInTheDocument();
  });

  it('renders the three group fixtures', async () => {
    renderRoute('/students/groups');
    await screen.findByRole('heading', { name: 'Groups Overview' });

    expect(screen.getByRole('heading', { name: 'Phonics Focus' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Addition Masters' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Early Readers' })).toBeInTheDocument();
  });

  it("renders each group's student count, primary need and status", async () => {
    renderRoute('/students/groups');
    await screen.findByRole('heading', { name: 'Groups Overview' });

    const phonics = screen.getByRole('heading', { name: 'Phonics Focus' }).closest('article')!;
    expect(within(phonics).getByText('8')).toBeInTheDocument();
    expect(within(phonics).getByText('Letter Sounds & Blending')).toBeInTheDocument();
    expect(within(phonics).getByText('Needs Intervention')).toBeInTheDocument();

    const addition = screen.getByRole('heading', { name: 'Addition Masters' }).closest('article')!;
    expect(within(addition).getByText('12')).toBeInTheDocument();
    expect(within(addition).getByText('Advanced Number Bonds')).toBeInTheDocument();
    expect(within(addition).getByText('Exceeding Expectations')).toBeInTheDocument();

    const earlyReaders = screen.getByRole('heading', { name: 'Early Readers' }).closest('article')!;
    expect(within(earlyReaders).getByText('6')).toBeInTheDocument();
    expect(within(earlyReaders).getByText('Sight Words & Fluency')).toBeInTheDocument();
    expect(within(earlyReaders).getByText('On Track')).toBeInTheDocument();
  });
});
