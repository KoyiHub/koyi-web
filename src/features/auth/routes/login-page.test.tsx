import { describe, expect, it } from 'vitest';

import { renderRoute, screen } from '@/test/test-utils';

describe('LoginPage', () => {
  it('renders the welcome back heading', async () => {
    renderRoute('/login');

    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const { user } = renderRoute('/login');
    await screen.findByRole('heading', { name: 'Welcome back' });

    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('rejects an invalid email', async () => {
    const { user } = renderRoute('/login');
    await screen.findByRole('heading', { name: 'Welcome back' });

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
  });

  it('navigates to the dashboard on a valid submit', async () => {
    const { user } = renderRoute('/login');
    await screen.findByRole('heading', { name: 'Welcome back' });

    await user.type(screen.getByLabelText('Email'), 'teacher@koyi.ng');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('links to the signup page', async () => {
    renderRoute('/login');
    await screen.findByRole('heading', { name: 'Welcome back' });

    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/signup');
  });
});
