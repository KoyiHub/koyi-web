import { describe, expect, it } from 'vitest';

import { renderRoute, screen } from '@/test/test-utils';

describe('SignupPage', () => {
  it('renders the create account heading', async () => {
    renderRoute('/signup');

    expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const { user } = renderRoute('/signup');
    await screen.findByRole('heading', { name: 'Create your account' });

    await user.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(await screen.findByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Email address is required')).toBeInTheDocument();
  });

  it('rejects mismatched passwords', async () => {
    const { user } = renderRoute('/signup');
    await screen.findByRole('heading', { name: 'Create your account' });

    await user.type(screen.getByLabelText('Full Name'), 'Amina Yusuf');
    await user.type(screen.getByLabelText('Email Address'), 'amina@koyi.ng');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'password456');
    await user.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
  });

  it('follows the provisional success navigation to login on a valid submit', async () => {
    const { user } = renderRoute('/signup');
    await screen.findByRole('heading', { name: 'Create your account' });

    await user.type(screen.getByLabelText('Full Name'), 'Amina Yusuf');
    await user.type(screen.getByLabelText('Email Address'), 'amina@koyi.ng');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  });
});
