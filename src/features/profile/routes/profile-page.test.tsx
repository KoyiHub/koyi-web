import { describe, expect, it } from 'vitest';

import { renderRoute, screen } from '@/test/test-utils';

describe('ProfilePage', () => {
  it('renders the teacher identity', async () => {
    renderRoute('/profile');

    expect(await screen.findByRole('heading', { name: 'Teacher Profile' })).toBeInTheDocument();
    expect(screen.getByText('Amina Yusuf')).toBeInTheDocument();
    expect(screen.getByText('Primary 4 Class Teacher')).toBeInTheDocument();
    expect(screen.getByText('amina.y@start-riteadmin.sch.ng')).toBeInTheDocument();
  });

  it('renders school and class information', async () => {
    renderRoute('/profile');
    await screen.findByRole('heading', { name: 'Teacher Profile' });

    expect(screen.getByText('Start-Rite International School, Abuja')).toBeInTheDocument();
    expect(screen.getByText('Primary 4 - Class A')).toBeInTheDocument();
  });

  it('navigates to login on Log Out', async () => {
    const { user } = renderRoute('/profile');
    await screen.findByRole('heading', { name: 'Teacher Profile' });

    await user.click(screen.getByRole('button', { name: 'Log Out' }));

    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  });

  it('shows Edit Profile as disabled', async () => {
    renderRoute('/profile');
    await screen.findByRole('heading', { name: 'Teacher Profile' });

    expect(screen.getByRole('button', { name: 'Edit Profile' })).toBeDisabled();
  });
});
