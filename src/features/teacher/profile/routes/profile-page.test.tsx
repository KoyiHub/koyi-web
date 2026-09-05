import { describe, expect, it } from 'vitest';

import { mockAuthUser } from '@/mocks/handlers';
import { renderRoute, screen } from '@/test/test-utils';

describe('ProfilePage', () => {
  it('renders account information from /me/', async () => {
    renderRoute('/teacher/profile');

    expect(await screen.findByRole('heading', { name: 'Teacher Profile' })).toBeInTheDocument();
    expect(await screen.findByText(mockAuthUser.full_name)).toBeInTheDocument();
    expect(screen.getByText(mockAuthUser.email)).toBeInTheDocument();
    expect(screen.getByText('GHS-T-00007')).toBeInTheDocument();
  });

  it('shows a loading state before /me/ resolves', async () => {
    renderRoute('/teacher/profile');

    expect(await screen.findByText('Loading account details…')).toBeInTheDocument();
    await screen.findByText(mockAuthUser.full_name);
  });

  it('renders the school from /me/ and the class from the dashboard payload', async () => {
    renderRoute('/teacher/profile');
    await screen.findByText(mockAuthUser.full_name);

    expect(await screen.findByText('Greenwood Primary School')).toBeInTheDocument();
  });

  it('navigates to login on Log Out', async () => {
    const { user } = renderRoute('/teacher/profile');
    await screen.findByText(mockAuthUser.full_name);

    await user.click(screen.getByRole('button', { name: 'Log Out' }));

    expect(await screen.findByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
  });

  it('shows Edit Profile as disabled', async () => {
    renderRoute('/teacher/profile');
    await screen.findByRole('heading', { name: 'Teacher Profile' });

    expect(screen.getByRole('button', { name: 'Edit Profile' })).toBeDisabled();
  });
});
