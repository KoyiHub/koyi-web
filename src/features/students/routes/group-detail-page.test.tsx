import { describe, expect, it } from 'vitest';

import { renderRoute, screen, within } from '@/test/test-utils';

describe('GroupDetailPage', () => {
  it('renders the Phonics Focus heading', async () => {
    renderRoute('/students/groups/grp-phonics-focus');

    expect(await screen.findByRole('heading', { name: 'Phonics Focus' })).toBeInTheDocument();
  });

  it('renders the group metrics', async () => {
    renderRoute('/students/groups/grp-phonics-focus');
    await screen.findByRole('heading', { name: 'Phonics Focus' });

    expect(screen.getByText('42%')).toBeInTheDocument();
    expect(screen.getByText('+15%')).toBeInTheDocument();
    expect(screen.getByText('Critical Needs')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2 Days Ago')).toBeInTheDocument();
  });

  it('renders the students preview', async () => {
    renderRoute('/students/groups/grp-phonics-focus');
    await screen.findByRole('heading', { name: 'Phonics Focus' });

    const roster = screen
      .getByRole('heading', { name: 'Students in This Group' })
      .closest('section')!;
    expect(within(roster).getByText('Aisha O.')).toBeInTheDocument();
    expect(within(roster).getByText('Struggling with CVC words')).toBeInTheDocument();
    expect(within(roster).getByText('Needs Help')).toBeInTheDocument();
    expect(within(roster).getByText('Emeka I.')).toBeInTheDocument();
    expect(within(roster).getByText('Improving on Digraphs')).toBeInTheDocument();
    expect(within(roster).getByText('Fatima K.')).toBeInTheDocument();
    expect(within(roster).getByText('Consistent progress')).toBeInTheDocument();
  });

  it('renders common skill gaps', async () => {
    renderRoute('/students/groups/grp-phonics-focus');
    await screen.findByRole('heading', { name: 'Phonics Focus' });

    const gaps = screen.getByRole('heading', { name: 'Common Skill Gaps' }).closest('section')!;
    expect(within(gaps).getByText('CVC Word Blending')).toBeInTheDocument();
    expect(within(gaps).getByText('6/8 Struggling')).toBeInTheDocument();
    expect(within(gaps).getByText('Initial Consonant Sounds')).toBeInTheDocument();
    expect(within(gaps).getByText('4/8 Struggling')).toBeInTheDocument();
  });

  it('renders recent assessments', async () => {
    renderRoute('/students/groups/grp-phonics-focus');
    await screen.findByRole('heading', { name: 'Phonics Focus' });

    const recent = screen.getByRole('heading', { name: 'Recent Assessments' }).closest('section')!;
    expect(within(recent).getByText('Oct 12, 2023')).toBeInTheDocument();
    expect(within(recent).getByText('Consonant Blends')).toBeInTheDocument();
    expect(within(recent).getByText('45%')).toBeInTheDocument();
    expect(within(recent).getByText('Oct 05, 2023')).toBeInTheDocument();
    expect(within(recent).getByText('Vowel Sounds')).toBeInTheDocument();
    expect(within(recent).getByText('38%')).toBeInTheDocument();
  });

  it('navigates to assessment setup when Reassess Group is clicked', async () => {
    const { user } = renderRoute('/students/groups/grp-phonics-focus');
    await screen.findByRole('heading', { name: 'Phonics Focus' });

    await user.click(screen.getByRole('button', { name: 'Reassess Group' }));

    expect(
      await screen.findByRole('heading', { name: 'New Assessment Session' }),
    ).toBeInTheDocument();
  });

  it('shows a safe not-found state for an unknown group ID', async () => {
    renderRoute('/students/groups/does-not-exist');

    expect(await screen.findByRole('heading', { name: 'Group not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Groups/ })).toBeInTheDocument();
  });
});
