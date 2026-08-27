import { describe, expect, it } from 'vitest';

import { renderRoute, screen, within } from '@/test/test-utils';

describe('StudentsPage', () => {
  it('renders the Students heading', async () => {
    renderRoute('/teacher/students');

    expect(await screen.findByRole('heading', { name: 'Students' })).toBeInTheDocument();
  });

  it('renders the fixture student roster', async () => {
    renderRoute('/teacher/students');
    await screen.findByRole('heading', { name: 'Students' });

    expect(screen.getByRole('heading', { name: 'Amina Yusuf' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Chinedu Okafor' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fatima Bello' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Zainab Idris' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Emeka Nnamdi' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Samuel Ojo' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Grace Mba' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Blessing Eze' })).toBeInTheDocument();
  });

  it('shows the full roster by default under the All filter', async () => {
    renderRoute('/teacher/students');
    await screen.findByRole('heading', { name: 'Students' });

    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('article')).toHaveLength(8);
  });

  it('filters to only Intermediate students when Intermediate is selected', async () => {
    const { user } = renderRoute('/teacher/students');
    await screen.findByRole('heading', { name: 'Students' });

    await user.click(screen.getByRole('button', { name: 'Intermediate' }));

    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'Amina Yusuf' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Emeka Nnamdi' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Blessing Eze' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Chinedu Okafor' })).not.toBeInTheDocument();
  });

  it('filters to only Struggling students when Struggling is selected', async () => {
    const { user } = renderRoute('/teacher/students');
    await screen.findByRole('heading', { name: 'Students' });

    await user.click(screen.getByRole('button', { name: 'Struggling' }));

    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Fatima Bello' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Samuel Ojo' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Amina Yusuf' })).not.toBeInTheDocument();
  });

  it('does not show the empty-state message while a filter still has matches', async () => {
    const { user } = renderRoute('/teacher/students');
    await screen.findByRole('heading', { name: 'Students' });

    await user.click(screen.getByRole('button', { name: 'Strong' }));

    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(screen.queryByText('No students match this filter.')).not.toBeInTheDocument();
  });

  it('navigates to the selected student when View details is clicked', async () => {
    const { user } = renderRoute('/teacher/students');
    await screen.findByRole('heading', { name: 'Students' });

    const aminaCard = screen.getByRole('heading', { name: 'Amina Yusuf' }).closest('article');
    expect(aminaCard).not.toBeNull();

    await user.click(within(aminaCard!).getByRole('link', { name: /View details/ }));

    expect(await screen.findByText('Student ID')).toBeInTheDocument();
    expect(screen.getByText('2026-04A-12')).toBeInTheDocument();
  });
});
